import type { Request, Response, NextFunction } from "express";

const lastRequestTime = new Map<string, number>();

export function geocodeRateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip ?? "unknown";
    const now = Date.now();
    const last = lastRequestTime.get(ip) || 0;

    if (now - last < 1000) {
        return res.status(429).json({
            error: "Too many geocoding requests. Please wait a moment."
        })
    }

    lastRequestTime.set(ip, now);
    next();
}