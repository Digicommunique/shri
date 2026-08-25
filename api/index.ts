import type { Request, Response } from "express";

let app: any = null;
let bootError: any = null;

async function getAppInstance() {
  if (app) return app;
  try {
    // 1. Try to load compiled server.cjs bundle
    // @ts-ignore
    const serverModule = await import("../dist/server.cjs");
    app = serverModule.app;
    console.log("[BOOT] Vercel Serverless Function loaded server.cjs bundle successfully.");
    return app;
  } catch (err: any) {
    console.warn("[BOOT] Failed to load server.cjs bundle, falling back to direct server module:", err.message);
    try {
      // 2. Direct fallback to server.ts
      // @ts-ignore
      const directModule = await import("../server.ts");
      app = directModule.app;
      return app;
    } catch (fallbackErr: any) {
      console.error("[BOOT ERROR] Failed to load both server.cjs and server.ts:", fallbackErr);
      bootError = {
        message: fallbackErr.message || String(fallbackErr),
        stack: fallbackErr.stack ? fallbackErr.stack.split("\n") : []
      };
      return null;
    }
  }
}

// Initial boot attempt
getAppInstance().catch(() => {});

export default async function handler(req: any, res: any) {
  const activeApp = await getAppInstance();

  // Self-Diagnostic Startup Info for Vercel Serverless environment
  const urlPath = req.url || "";
  if (urlPath === "/api/debug-env" || urlPath === "/api/health-diagnostic") {
    return res.status(200).json({
      diagnostics: "high-availability-wrapper",
      serverBooted: !!activeApp,
      bootError,
      env: {
        NODE_ENV: process.env.NODE_ENV || "not-set",
        VERCEL: process.env.VERCEL || "not-set",
        SUPABASE_URL_CONFIGURED: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
        SUPABASE_KEY_CONFIGURED: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY)
      }
    });
  }

  if (bootError && !activeApp) {
    return res.status(500).json({
      error: "Vercel Boot Failure",
      message: bootError.message,
      stack: bootError.stack,
      guidance: "High-availability server bundle failed to load. Please verify your build logs and environment variables."
    });
  }

  if (!activeApp) {
    return res.status(500).json({
      error: "Vercel Server Uninitialized",
      message: "The Express app instance is not initialized."
    });
  }

  // Pass request to the Express application
  try {
    return activeApp(req, res);
  } catch (err: any) {
    console.error("[VERCEL EXCEPTION DURING REQUEST]:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message || String(err),
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
    });
  }
}
