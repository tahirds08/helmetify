import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)
TOKEN_SECRET = os.getenv("AUTH_SECRET", "replace-this-development-secret-before-production").encode()
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7
AVATAR_UPLOAD_DIR = Path("uploads") / "avatars"
MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp"}


class SignUpRequest(BaseModel):
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class SignInRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class UpdateProfileRequest(BaseModel):
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)


def _password_hash(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 310_000)
    return f"{salt}${digest.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, expected = stored_hash.split("$", 1)
    except ValueError:
        return False
    return hmac.compare_digest(_password_hash(password, salt), stored_hash)


def _create_token(user: User) -> str:
    payload = base64.urlsafe_b64encode(json.dumps({"sub": user.id, "exp": int(time.time()) + TOKEN_TTL_SECONDS}).encode()).rstrip(b"=")
    signature = hmac.new(TOKEN_SECRET, payload, hashlib.sha256).digest()
    return f"{payload.decode()}.{base64.urlsafe_b64encode(signature).rstrip(b'=').decode()}"


def _public_user(user: User) -> dict:
    return {"id": str(user.id), "name": f"{user.first_name} {user.last_name}", "firstName": user.first_name, "lastName": user.last_name, "email": user.email, "avatar": user.avatar}


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme), db: Session = Depends(get_db)) -> User:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please sign in to continue.")
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized
    try:
        payload, signature = credentials.credentials.split(".", 1)
        signature_bytes = base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))
        expected_signature = hmac.new(TOKEN_SECRET, payload.encode(), hashlib.sha256).digest()
        decoded = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        if not hmac.compare_digest(signature_bytes, expected_signature) or decoded["exp"] < time.time():
            raise ValueError
        user = db.get(User, int(decoded["sub"]))
    except (KeyError, ValueError, json.JSONDecodeError, TypeError):
        raise unauthorized from None
    if user is None:
        raise unauthorized
    return user


@router.post("/sign-up", status_code=status.HTTP_201_CREATED)
def sign_up(request: SignUpRequest, db: Session = Depends(get_db)):
    email = request.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(first_name=request.first_name.strip(), last_name=request.last_name.strip(), email=email, password_hash=_password_hash(request.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": _create_token(user), "user": _public_user(user)}


@router.post("/sign-in")
def sign_in(request: SignInRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if user is None or not _verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Your email or password is incorrect.")
    return {"token": _create_token(user), "user": _public_user(user)}


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return _public_user(user)


@router.patch("/me")
def update_me(request: UpdateProfileRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user.first_name = request.first_name.strip()
    user.last_name = request.last_name.strip()
    db.commit()
    db.refresh(user)
    return _public_user(user)


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG, or WebP image.")

    image_data = await file.read()
    if not image_data or len(image_data) > MAX_AVATAR_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Profile images must be between 1 byte and 5 MB.")

    extension = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[file.content_type]
    AVATAR_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{user.id}-{uuid4().hex}{extension}"
    (AVATAR_UPLOAD_DIR / filename).write_bytes(image_data)

    user.avatar = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(user)
    return _public_user(user)
