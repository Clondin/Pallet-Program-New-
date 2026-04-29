// Confirm-by deadline rules:
// - 4 months before the holiday date
// - rounded back to the previous Friday (end of business week)

const FRIDAY = 5

function previousFriday(date: Date): Date {
  const day = date.getDay()
  const offset = day >= FRIDAY ? day - FRIDAY : day + 7 - FRIDAY
  const result = new Date(date)
  result.setDate(date.getDate() - offset)
  result.setHours(23, 59, 59, 999)
  return result
}

function subtractMonths(date: Date, months: number): Date {
  const result = new Date(date)
  const targetMonth = result.getMonth() - months
  result.setMonth(targetMonth)
  return result
}

export function computeConfirmByDate(holidayMs: number): number {
  const holiday = new Date(holidayMs)
  const fourMonthsBefore = subtractMonths(holiday, 4)
  return previousFriday(fourMonthsBefore).getTime()
}

export function formatDeadlineCountdown(deadlineMs: number, nowMs = Date.now()) {
  const diffMs = deadlineMs - nowMs
  const dayMs = 86_400_000
  const days = Math.ceil(diffMs / dayMs)

  if (days < 0) {
    const overdue = Math.abs(days)
    return {
      label: overdue === 1 ? '1 day overdue' : `${overdue} days overdue`,
      tone: 'overdue' as const,
    }
  }
  if (days === 0) return { label: 'Due today', tone: 'urgent' as const }
  if (days <= 7) {
    return {
      label: days === 1 ? '1 day to confirm' : `${days} days to confirm`,
      tone: 'urgent' as const,
    }
  }
  if (days <= 30) {
    return {
      label: `${days} days to confirm`,
      tone: 'soon' as const,
    }
  }
  return { label: `${days} days to confirm`, tone: 'normal' as const }
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
