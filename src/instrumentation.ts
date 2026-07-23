const SYNC_INTERVAL_MS = 10 * 60 * 1000;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.ERP_API_KEY) return;

  const { runErpSync } = await import("@/lib/erp-sync");
  let running = false;

  async function tick() {
    if (running) return;
    running = true;
    try {
      const result = await runErpSync();
      if (result.errors.length > 0) {
        console.error("ERP sync completed with errors:", result.errors);
      }
    } catch (e) {
      console.error("ERP sync tick failed:", e);
    } finally {
      running = false;
    }
  }

  setInterval(tick, SYNC_INTERVAL_MS);
  setTimeout(tick, 30_000);
}
