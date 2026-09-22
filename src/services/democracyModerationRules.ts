export function validateDemocracyBanDays(days?: number): asserts days is number {
  if (
    !Number.isSafeInteger(days) ||
    !days ||
    days < 1 ||
    !Number.isFinite(new Date(Date.now() + days * 86_400_000).getTime())
  ) {
    throw new Error('invalid-ban-days')
  }
}
