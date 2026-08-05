from dotenv import load_dotenv
import os
from typing import cast

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL not found in .env file")

DATABASE_URL = cast(str, DATABASE_URL)