/** Pause between live API calls to reduce rate-limit risk. */
export const INTEGRATION_ACTION_DELAY_MS = 2_000;

export function delay(ms = INTEGRATION_ACTION_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
