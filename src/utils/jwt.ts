export interface JwtPayload {
  uid: string;
  login: string;
  role: string;
  tokenType: string;
  iat?: number;
  exp?: number;
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error decoding JWT:', error);
    }
    return null;
  }
};

export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeJwt(token);
  return decoded?.uid || null;
};
