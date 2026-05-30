/** Drops warehouse metadata before returning integration-shaped data to ports. */
export function stripSyncedAt<TPayload>(
  row: TPayload & { syncedAt: string },
): TPayload {
  const { syncedAt, ...rest } = row;
  void syncedAt;
  return rest as TPayload;
}
