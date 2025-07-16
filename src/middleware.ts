import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next();

  // Add security headers
  const cspHeader = [
    // Default directives
    "default-src 'self'",
    // Scripts
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.firebase.com",
    // Styles
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts
    "font-src 'self' https://fonts.gstatic.com",
    // Images
    "img-src 'self' data: https:",
    // Connect (APIs, WebSocket)
    // --- THIS IS THE CRITICAL CHANGE ---
    "connect-src 'self' " +
      "https://*.firebaseapp.com https://*.firebase.com https://api.openai.com " +
      "https://identitytoolkit.googleapis.com " + // Added for general Firebase Auth calls
      "https://securetoken.googleapis.com " + // Added for auth token fetching (the main missing piece for "auth/network-request-failed")
      "https://firestore.googleapis.com " + // Added for Firestore backend connections
      "https://www.googleapis.com " + // General Google APIs that might be used
      (process.env.NODE_ENV !== "production"
        ? "http://localhost:* ws://localhost:*"
        : ""), // IMPORTANT for localhost development!
    // Media
    "media-src 'none'",
    // Object/Embed
    "object-src 'none'",
    // Frames (used by Firebase Auth pop-ups/redirects)
    "frame-src https://*.firebaseapp.com https://*.firebase.com https://accounts.google.com", // Added accounts.google.com for Google Sign-In popups
    // Worker
    "worker-src 'self' blob:",
  ].join("; ");
  const securityHeaders = {
    // Content Security Policy
    "Content-Security-Policy": cspHeader,

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Prevent clickjacking
    "X-Frame-Options": "DENY",

    // XSS Protection
    "X-XSS-Protection": "1; mode=block",

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=()",

    // HSTS
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };

  // Apply headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Configure paths that need security headers
export const config = {
  matcher: [
    // Apply to all paths except API routes and static files
    "/((?!api/|_next/|static/|public/|favicon.ico).*)",
  ],
};
