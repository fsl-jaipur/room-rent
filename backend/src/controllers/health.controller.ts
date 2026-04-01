import type { Request, Response } from "express";

import { healthSchema } from "../shared/schema";

export function getHealth(_req: Request, res: Response) {
  const payload = healthSchema.parse({
    status: "ok",
    service: "api"
  });

  return res.json(payload);
}
