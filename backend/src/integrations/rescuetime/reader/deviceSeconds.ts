import type { RescueTimeDeviceSeconds } from '../../../shared/rescuetime-types.js';
import { RescueTimeClient } from '../client.js';

const client = new RescueTimeClient();

export async function fetchDeviceSeconds(
  date: string,
): Promise<RescueTimeDeviceSeconds> {
  const [desktopSeconds, mobileSeconds] = await Promise.all([
    client.fetchSourceTotalSeconds(date, 'computers'),
    client.fetchSourceTotalSeconds(date, 'mobile'),
  ]);
  return { date, desktopSeconds, mobileSeconds };
}
