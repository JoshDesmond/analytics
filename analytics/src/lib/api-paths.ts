export function withDateQuery(path: string, date: string): string {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}date=${encodeURIComponent(date)}`
}
