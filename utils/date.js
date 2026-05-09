const ONE_DAY = 24 * 60 * 60 * 1000

function pad(value) {
  return value < 10 ? `0${value}` : `${value}`
}

function formatDate(date = new Date()) {
  const d = typeof date === 'string' ? parseDate(date) : date
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatMonth(date = new Date()) {
  const d = typeof date === 'string' ? parseDate(date) : date
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

function parseDate(dateStr) {
  const parts = dateStr.split('-').map(Number)
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function addDays(dateStr, amount) {
  const next = parseDate(dateStr)
  next.setDate(next.getDate() + amount)
  return formatDate(next)
}

function isBefore(a, b) {
  return a < b
}

function isAfter(a, b) {
  return a > b
}

function isAfterDeadline(deadline) {
  if (!deadline) return false
  const [hour, minute] = deadline.split(':').map(Number)
  const now = new Date()
  const deadlineDate = new Date()
  deadlineDate.setHours(hour || 0, minute || 0, 0, 0)
  return now.getTime() >= deadlineDate.getTime()
}

function getRecentDays(count = 7) {
  const today = formatDate()
  const days = []
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = addDays(today, -index)
    days.push({
      date,
      label: parseDate(date).getDate(),
      isToday: date === today,
    })
  }
  return days
}

function getMonthGrid(monthDate = new Date()) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const last = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  const startOffset = first.getDay()
  const total = Math.ceil((startOffset + last.getDate()) / 7) * 7
  const start = new Date(first.getTime() - startOffset * ONE_DAY)
  const today = formatDate()
  const days = []

  for (let index = 0; index < total; index += 1) {
    const current = new Date(start.getTime() + index * ONE_DAY)
    const date = formatDate(current)
    days.push({
      date,
      label: current.getDate(),
      inMonth: current.getMonth() === monthDate.getMonth(),
      isToday: date === today,
    })
  }

  return days
}

function displayDate(dateStr) {
  const date = parseDate(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

module.exports = {
  addDays,
  displayDate,
  formatDate,
  formatMonth,
  getMonthGrid,
  getRecentDays,
  isAfter,
  isAfterDeadline,
  isBefore,
  parseDate,
}

