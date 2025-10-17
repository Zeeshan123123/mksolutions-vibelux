import cron from 'node-cron'

export function getCronRunner() {
  const tasks: cron.ScheduledTask[] = []

  const start = () => {
    // Daily weather refresh at 02:00 UTC
    tasks.push(cron.schedule('0 2 * * *', async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/facility/weather/refresh?days=1`).catch(() => null)
      } catch {}
    }, { scheduled: true }))

    // Daily task due notifications at 08:00 UTC
    tasks.push(cron.schedule('0 8 * * *', async () => {
      try { await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/planning/tasks/notify-due`).catch(() => null) } catch {}
    }, { scheduled: true }))

    // Placeholder: ML run polling every 10 minutes
    tasks.push(cron.schedule('*/10 * * * *', async () => {
      try {
        // Trigger ML worker to process pending runs
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/ml/worker/process`).catch(() => null)
      } catch {}
    }, { scheduled: true }))

    // Accounting sync every day at 03:00 UTC (if facility known via server session route)
    tasks.push(cron.schedule('0 3 * * *', async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || ''
        // Attempt to get current facility
        const f = await fetch(`${base}/api/facility`).catch(() => null)
        if (f && f.ok) {
          const data = await f.json().catch(() => null)
          const facilityId = data?.facility?.id
          if (facilityId) {
            await fetch(`${base}/api/accounting/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ facilityId, operation: 'sync' })
            }).catch(() => null)
          }
        }
      } catch {}
    }, { scheduled: true }))

    // Export cleanup daily at 04:00 UTC
    tasks.push(cron.schedule('0 4 * * *', async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/exports/cleanup`, { method: 'POST' }).catch(() => null)
      } catch {}
    }, { scheduled: true }))
  }

  const stop = () => {
    tasks.forEach(t => t.stop())
  }

  return { start, stop }
}

// cron-runner service

export class CronRunnerService {
  private static instance: CronRunnerService;

  private constructor() {}

  static getInstance(): CronRunnerService {
    if (!CronRunnerService.instance) {
      CronRunnerService.instance = new CronRunnerService();
    }
    return CronRunnerService.instance;
  }

  async initialize(): Promise<void> {
    // Initialize service
  }

  async execute(params: any): Promise<any> {
    // Execute service logic
    return { success: true, data: params };
  }
}

// Export both named and default exports
export const cronRunner = CronRunnerService.getInstance();
export const getCron = () => cronRunner;
export default cronRunner;
