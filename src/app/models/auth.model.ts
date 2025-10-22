export type UserRole = 'admin' | 'customer' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface RegisteredUser extends User {
  password: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignupPayload extends Credentials {
  name: string;
  role?: UserRole;
}

// Simple fake JWT generator for demo-only (header.payload.signature)
export function createFakeJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'none', typ: 'JWT' };
  const enc = (obj: unknown) => btoa(JSON.stringify(obj));
  return `${enc(header)}.${enc(payload)}.${enc('signature')}`;
}