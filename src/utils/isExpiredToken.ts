export default function isExpiredToken(tokenExpireIn: string): boolean {
  return Date.now() > new Date(tokenExpireIn).getTime();
}