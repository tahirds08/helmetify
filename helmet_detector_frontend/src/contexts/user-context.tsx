'use client';

import * as React from 'react';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(
  undefined
);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({
  children,
}: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{
    user: User | null;
    error: string | null;
    isLoading: boolean;
  }>({
    user: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getUser();

      // No logged-in user → this is NORMAL, not an error.
      if (error === 'UNAUTHORIZED') {
        setState({
          user: null,
          error: null,
          isLoading: false,
        });
        return;
      }

      // Real server/network error
      if (error) {
        logger.error(error);

        setState({
          user: null,
          error,
          isLoading: false,
        });

        return;
      }

      setState({
        user: data ?? null,
        error: null,
        isLoading: false,
      });
    } catch (err) {
      logger.error(err);

      setState({
        user: null,
        error: 'Unable to connect to the server.',
        isLoading: false,
      });
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err) => {
      logger.error(err);
    });
  }, [checkSession]);

  return (
    <UserContext.Provider
      value={{
        ...state,
        checkSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;