import { parseJwt } from '@/utils/helpers';

export function isAdmin(sessionStorage) {
  const token = sessionStorage.getItem('x-auth-token');
  if (token ) {
    const jwt = parseJwt(token);
    return JSON.parse(jwt['client-identity']).accountType === 'ADMIN';
  }
  return false;
}
