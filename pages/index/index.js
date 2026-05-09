const dateUtil = require('../../utils/date')
const storage = require('../../utils/storage')
const { getCopy } = require('../../utils/copywriting')

const modeLabels = {
  gentle: '温和',
  sharp: '犀利',
  hell: '地狱',
}

Page({
  data: {
    todayLabel: '',
    todayStatus: '',
    modeLabel: '',
    quote: '',
    hasCheckedInToday: false,
    streakDays: 0,
    currentWeightText: '--',
    targetWeightText: '--',
    totalCheckins: 0,
    recentDays: [],
    latestCheckin: null,
    latestCheckinDate: '',
  },

  onShow() {
    this.refresh()
  },

  onShareAppMessage() {
    return {
      title: '今天减了嘛？别光说，来打卡。',
      path: '/pages/index/index',
    }
  },

  refresh() {
    const profile = storage.getProfile()
    const today = dateUtil.formatDate()
    const checkins = storage.getCheckins()
    const hasCheckedInToday = storage.hasCheckin(today)
    const latest = storage.getLatestCheckin()
    const recentDays = dateUtil.getRecentDays(7).map((item) => ({
      ...item,
      checked: storage.hasCheckin(item.date),
    }))

    this.setData({
      todayLabel: dateUtil.displayDate(today),
      todayStatus: hasCheckedInToday ? '已打卡' : '未打卡',
      modeLabel: modeLabels[profile.reminderMode] || '犀利',
      quote: getCopy('daily', profile.reminderMode),
      hasCheckedInToday,
      streakDays: storage.calculateStreak(),
      currentWeightText: profile.currentWeight ? `${profile.currentWeight}kg` : '--',
      targetWeightText: profile.targetWeight ? `${profile.targetWeight}kg` : '--',
      totalCheckins: checkins.length,
      recentDays,
      latestCheckin: latest ? this.decorateCheckin(latest) : null,
      latestCheckinDate: latest ? dateUtil.displayDate(latest.checkinDate) : '',
    })

    this.maybeShowMissedPopup(profile)
  },

  decorateCheckin(item) {
    return {
      ...item,
      weightText: item.weight ? `${item.weight}kg` : '未记录体重',
      noteText: item.note || item.mood || '照片已存档，等以后对比时它会说真话。',
    }
  },

  maybeShowMissedPopup(profile) {
    if (this.popupOpening) return
    const missed = storage.getMissedCandidate(profile)
    if (!missed) return

    const noticeText = getCopy('missed_checkin', profile.reminderMode)
    this.popupOpening = true
    wx.showModal({
      title: missed.isToday ? '今天还没打卡' : '漏打卡了',
      content: noticeText,
      confirmText: missed.isToday ? '现在打卡' : '补打卡',
      cancelText: '先放过我',
      success: (res) => {
        storage.markMissedNotice({
          missedDate: missed.missedDate,
          noticeText,
          noticeMode: profile.reminderMode,
          action: res.confirm ? 'click_checkin' : 'dismiss',
        })
        if (res.confirm) {
          const makeup = missed.isToday ? 0 : 1
          wx.navigateTo({
            url: `/pages/checkin/checkin?date=${missed.missedDate}&makeup=${makeup}`,
          })
        }
      },
      complete: () => {
        this.popupOpening = false
      },
    })
  },

  goCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/checkin',
    })
  },
})

