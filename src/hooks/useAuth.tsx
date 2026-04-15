import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { sdk, isConfigured } from '../lib/sdk';

export type AuthState = 'loading' | 'demo' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  state: AuthState;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  state: 'demo',
  login: async () => {},
  logout: () => {},
});

/**
 * Wraps the app with UiPath OAuth PKCE auth.
 *
 * State machine:
 *  - "demo"            → env vars not configured; sample data mode
 *  - "loading"         → SDK.initialize() in progress (handles callback or redirect)
 *  - "authenticated"   → valid token present
 *  - "unauthenticated" → configured but not yet signed in (shows login button)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(isConfigured ? 'loading' : 'demo');

  useEffect(() => {
    if (!isConfigured || !sdk) return;

    // initialize() handles three cases automatically:
    //   1. OAuth callback in URL → exchanges code for token
    //   2. Token in storage     → restores session silently
    //   3. Neither              → stays unauthenticated (caller must invoke login())
    sdk
      .initialize()
      .then(() => setState(sdk!.isAuthenticated() ? 'authenticated' : 'unauthenticated'))
      .catch(() => setState('unauthenticated'));
  }, []);

  const login = async () => {
    if (!sdk) return;
    // Calling initialize() when unauthenticated triggers a redirect to UiPath auth.
    await sdk.initialize();
    setState(sdk.isAuthenticated() ? 'authenticated' : 'unauthenticated');
  };

  const logout = () => {
    sdk?.logout();
    setState('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
