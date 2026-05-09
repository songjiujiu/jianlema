const dateUtil = require('./date')

const KEYS = {
  profile: 'jianlema_profile',
  checkins: 'jianlema_checkins',
  notices: 'jianlema_missed_notices',
}

const defaultProfile = {
  nickname: '减脂选手',
  avatarUrl: '',
  height: '',
  startWeight: '',
  currentWeight: '',
  targetWeight: '',
  reminderMode: 'sharp',
  reminderTime: '20:30',
  checkinDeadline: '21:30',
  reminderPopupEnabled: true,
  onboarded: false,
}

function nowISO() {
  return new Date().toISOString()
}

function ensureProfile() {
  const existing = wx.getStorageSync(KEYS.profile)
  if (existing) return existing
  const profile = {
    ...defaultProfile,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  wx.setStorageSync(KEYS.profile, profile)
  return profile
}

function getProfile() {
  return ensureProfile()
}

function saveProfile(profile) {
  const next = {
    ...defaultProfile,
    ...profile,
    updatedAt: nowISO(),
  }
  wx.setStorageSync(KEYS.profile, next)
  return next
}

function getCheckins() {
  const list = wx.getStorageSync(KEYS.checkins) || []
  return list.sort((a, b) => {
    if (a.checkinDate === b.checkinDate) return b.createdAt.localeCompare(a.createdAt)
    return b.checkinDate.localeCompare(a.checkinDate)
  })
}

function saveCheckins(list) {
  wx.setStorageSync(KEYS.checkins, list)
  return list
}

function addCheckin(payload) {
  const list = getCheckins()
  const record = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    checkinDate: payload.checkinDate || dateUtil.formatDate(),
    imagePath: payload.imagePath,
    weight: payload.weight || '',
    mood: payload.mood || '',
    note: payload.note || '',
    isMakeup: Boolean(payload.isMakeup),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  list.unshift(record)
  saveCheckins(list)
  return record
}

function deleteCheckin(id) {
  const next = getCheckins().filter((item) => item.id !== id)
  saveCheckins(next)
  return next
}

function getCheckinsByDate(dateStr) {
  return getCheckins().filter((item) => item.checkinDate === dateStr)
}

function hasCheckin(dateStr) {
  return getCheckinsByDate(dateStr).length > 0
}

function getLatestCheckin(dateStr) {
  const list = dateStr ? getCheckinsByDate(dateStr) : getCheckins()
  return list[0] || null
}

function calculateStreak() {
  const today = dateUtil.formatDate()
  let cursor = hasCheckin(today) ? today : dateUtil.addDays(today, -1)
  let streak = 0

  while (true) {
    const records = getCheckinsByDate(cursor).filter((item) => !item.isMakeup)
    if (!records.length) break
    streak += 1
    cursor = dateUtil.addDays(cursor, -1)
  }

  return streak
}

function getNoticeRecords() {
  return wx.getStorageSync(KEYS.notices) || []
}

function hasNotice(missedDate) {
  return getNoticeRecords().some((item) => item.missedDate === missedDate)
}

function markMissedNotice(payload) {
  const list = getNoticeRecords()
  const record = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    missedDate: payload.missedDate,
    noticeText: payload.noticeText,
    noticeMode: payload.noticeMode,
    action: payload.action,
    shownAt: nowISO(),
  }
  list.unshift(record)
  wx.setStorageSync(KEYS.notices, list)
  return record
}

function getMissedCandidate(profile) {
  if (!profile.reminderPopupEnabled) return null
  if (!getCheckins().length) return null

  const today = dateUtil.formatDate()
  const yesterday = dateUtil.addDays(today, -1)

  if (!hasCheckin(yesterday) && !hasNotice(yesterday)) {
    return {
      missedDate: yesterday,
      isToday: false,
    }
  }

  if (
    dateUtil.isAfterDeadline(profile.checkinDeadline) &&
    !hasCheckin(today) &&
    !hasNotice(today)
  ) {
    return {
      missedDate: today,
      isToday: true,
    }
  }

  return null
}

function getWeightTrend() {
  return getCheckins()
    .filter((item) => item.weight)
    .reverse()
    .map((item) => ({
      date: item.checkinDate,
      label: dateUtil.displayDate(item.checkinDate),
      weight: Number(item.weight),
    }))
}

function clearAll() {
  wx.removeStorageSync(KEYS.profile)
  wx.removeStorageSync(KEYS.checkins)
  wx.removeStorageSync(KEYS.notices)
  return ensureProfile()
}

module.exports = {
  addCheckin,
  calculateStreak,
  clearAll,
  deleteCheckin,
  ensureProfile,
  getCheckins,
  getCheckinsByDate,
  getLatestCheckin,
  getMissedCandidate,
  getNoticeRecords,
  getProfile,
  getWeightTrend,
  hasCheckin,
  markMissedNotice,
  saveProfile,
}

