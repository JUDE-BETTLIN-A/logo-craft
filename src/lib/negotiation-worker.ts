import { prisma } from "@/lib/prisma";
import { syncNegotiationSession } from "@/lib/negotiation-service";

declare global {
  var __negotiationWorkerStarted__: boolean | undefined;
}

export function ensureNegotiationWorkerStarted() {
  if (globalThis.__negotiationWorkerStarted__) {
    return;
  }

  globalThis.__negotiationWorkerStarted__ = true;

  const interval = setInterval(async () => {
    try {
      const activeSessions = await prisma.negotiationSession.findMany({
        where: {
          status: {
            in: ["live", "paused", "agreed"],
          },
        },
        select: {
          id: true,
        },
      });

      for (const session of activeSessions) {
        await syncNegotiationSession(session.id);
      }
    } catch (error) {
      console.error("Negotiation worker sync failed:", error);
    }
  }, 5000);

  interval.unref?.();
}
