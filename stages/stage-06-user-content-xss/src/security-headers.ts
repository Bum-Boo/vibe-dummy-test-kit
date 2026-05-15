export const weakSecurityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  }
];

export function getSecurityHeaders(): Array<{ key: string; value: string }> {
  // Stage 06 intentionally vulnerable: this CSP is too broad and allows inline script behavior.
  return weakSecurityHeaders;
}

