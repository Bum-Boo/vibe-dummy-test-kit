export const fixedCorsConfig = {
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "X-Demo-User-Id"]
};

export const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'; object-src 'none'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer"
};

