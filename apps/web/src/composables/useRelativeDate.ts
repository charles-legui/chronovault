/**
 * Formats an ISO date string as a human-readable relative label.
 * Uses Intl.RelativeTimeFormat — no external dependency.
 */
export function useRelativeDate() {
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

  function relativeDate(iso: string): string {
    const diff = (new Date(iso).getTime() - Date.now()) / 1000 // seconds

    if (Math.abs(diff) < 60)     return rtf.format(Math.round(diff), 'second')
    if (Math.abs(diff) < 3600)   return rtf.format(Math.round(diff / 60), 'minute')
    if (Math.abs(diff) < 86400)  return rtf.format(Math.round(diff / 3600), 'hour')
    if (Math.abs(diff) < 604800) return rtf.format(Math.round(diff / 86400), 'day')
    if (Math.abs(diff) < 2592000) return rtf.format(Math.round(diff / 604800), 'week')
    if (Math.abs(diff) < 31536000) return rtf.format(Math.round(diff / 2592000), 'month')
    return rtf.format(Math.round(diff / 31536000), 'year')
  }

  function shortDate(iso: string): string {
    return new Intl.DateTimeFormat('fr', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso))
  }

  return { relativeDate, shortDate }
}
