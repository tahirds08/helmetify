'use client';

import type { User } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
const TOKEN_KEY = 'helmetify-auth-token';

export function getAvatarUrl(avatar?: string): string | undefined {
  if (!avatar) return undefined;
  return avatar.startsWith('http') ? avatar : `${API_URL}${avatar}`;
}

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface UpdateProfileParams {
  firstName: string;
  lastName: string;
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const token = localStorage.getItem(TOKEN_KEY);

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error:
          (body as { detail?: string } | null)?.detail ??
          'Something went wrong. Please try again.',
      };
    }

    return {
      data: body as T,
    };
  } catch {
    return {
      error: 'Unable to reach the server. Please check your connection and try again.',
    };
  }
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    const response = await request<{ token: string }>('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({
        first_name: params.firstName,
        last_name: params.lastName,
        email: params.email,
        password: params.password,
      }),
    });

    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }

    return { error: response.error };
  }

  async signInWithOAuth(
    _: SignInWithOAuthParams
  ): Promise<{ error?: string }> {
    return {
      error: 'Social sign-in is not available yet.',
    };
  }

  async signInWithPassword(
    params: SignInWithPasswordParams
  ): Promise<{ error?: string }> {
    const response = await request<{ token: string }>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }

    return { error: response.error };
  }

  async resetPassword(
    _: ResetPasswordParams
  ): Promise<{ error?: string }> {
    return {};
  }

  async updateProfile(
    params: UpdateProfileParams
  ): Promise<{ data?: User; error?: string }> {
    return request<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({
        first_name: params.firstName,
        last_name: params.lastName,
      }),
    });
  }

  async uploadAvatar(
    file: File
  ): Promise<{ data?: User; error?: string }> {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/auth/me/avatar`, {
        method: 'POST',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        body: formData,
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          error:
            (body as { detail?: string } | null)?.detail ??
            'Unable to upload the profile image.',
        };
      }

      return {
        data: body as User,
      };
    } catch {
      return {
        error: 'Unable to reach the server. Please check your connection and try again.',
      };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem(TOKEN_KEY);

    // No token = simply not logged in
    if (!token) {
      return {
        data: null,
      };
    }

    const response = await request<User>('/auth/me');

    // Token expired or invalid
    if (response.error?.includes('Please sign in')) {
      localStorage.removeItem(TOKEN_KEY);

      // Treat as logged out instead of an application error
      return {
        data: null,
      };
    }

    return {
      data: response.data ?? null,
      error: response.error,
    };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem(TOKEN_KEY);
    return {};
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}

export const authClient = new AuthClient();