import { getSetting } from "@rent/config";

import { createApp } from "./app";

export function startServer() {
  const { app, corsOrigin } = createApp();
  const port = Number(getSetting("PORT") ?? 4000);

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
    console.log(`CORS origin: ${corsOrigin}`);
  });
}
