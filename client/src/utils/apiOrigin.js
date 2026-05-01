/**
 * Public API origin, no trailing slash.
 * Production builds require REACT_APP_API_URL set at build time (Render shield-web Env).
 */
export function getApiOrigin() {
  const fromEnv = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000';
  }
  return '';
}

export function getGoogleAuthHref() {
  const origin = getApiOrigin();
  if (!origin) return '';
  const frontend = encodeURIComponent(window.location.origin);
  return `${origin}/api/auth/google?frontend=${frontend}`;
}
