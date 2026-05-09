const dateUtil = require('../../utils/date')
const storage = require('../../utils/storage')

Page({
  data: {
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    monthTitle: '',
    monthDays: [],
    checkins: [],
    selectedIds: [],
    compareImages: [],
    trendBars: [],
    trendText: '',
  },

  onLoad() {
    this.monthCursor = new Date()
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const checkins = storage.getCheckins()
    const selectedIds = this.data.selectedIds.filter((id) => checkins.some((item) => item.id === id))
    const decorated = checkins.map((item) => this.decorateCheckin(item, selectedIds))
    const compareImages = selectedIds
      .map((id) => checkins.find((item) => item.id === id))
      .filter(Boolean)

    this.setData({
      checkins: decorated,
      selectedIds,
      compareImages,
      ...this.buildMonth(),
      ...this.buildTrend(),
    })
  },

  decorateCheckin(item, selectedIds) {
    const pieces = []
    if (item.weight) pieces.push(`${item.weight}kg`)
    if (item.mood) pieces.push(item.mood)
    if (item.isMakeup) pieces.push('补打卡')
    return {
      ...item,
      displayDate: dateUtil.displayDate(item.checkinDate),
      summary: pieces.join(' · ') || '只拍照，没多说',
      selected: selectedIds.includes(item.id),
    }
  },

  buildMonth() {
    const today = dateUtil.formatDate()
    const checkins = storage.getCheckins()
    const earliest = checkins.length ? checkins[checkins.length - 1].checkinDate : ''
    const monthDays = dateUtil.getMonthGrid(this.monthCursor).map((item) => {
      const checked = storage.hasCheckin(item.date)
      const missed = Boolean(
        earliest &&
        item.inMonth &&
        dateUtil.isBefore(item.date, today) &&
        !dateUtil.isBefore(item.date, earliest) &&
        !checked
      )
      const classes = ['calendar-day']
      if (!item.inMonth) classes.push('muted-day')
      if (item.isToday) classes.push('today')
      if (checked) classes.push('checked')
      if (missed) classes.push('missed')

      return {
        ...item,
        checked,
        missed,
        statusText: checked ? '打卡' : missed ? '缺' : '',
        className: classes.join(' '),
      }
    })

    return {
      monthTitle: `${this.monthCursor.getFullYear()}年${this.monthCursor.getMonth() + 1}月`,
      monthDays,
    }
  },

  buildTrend() {
    const trend = storage.getWeightTrend().slice(-8)
    if (!trend.length) {
      return {
        trendBars: [],
        trendText: '暂无体重记录',
      }
    }

    const weights = trend.map((item) => item.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const range = max - min || 1
    const first = weights[0]
    const last = weights[weights.length - 1]
    const diff = Number((last - first).toFixed(1))

    return {
      trendBars: trend.map((item) => ({
        ...item,
        weight: item.weight.toFixed(1),
        height: Math.round(32 + ((item.weight - min) / range) * 92),
      })),
      trendText: diff === 0 ? '持平' : `${diff > 0 ? '+' : ''}${diff}kg`,
    }
  },

  prevMonth() {
    this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() - 1, 1)
    this.refresh()
  },

  nextMonth() {
    this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() + 1, 1)
    this.refresh()
  },

  openDate(event) {
    const selectedDate = event.currentTarget.dataset.date
    const today = dateUtil.formatDate()
    if (dateUtil.isAfter(selectedDate, today)) {
      wx.showToast({
        title: '未来还没到',
        icon: 'none',
      })
      return
    }

    wx.navigateTo({
      url: `/pages/checkin/checkin?date=${selectedDate}&makeup=${selectedDate === today ? 0 : 1}`,
    })
  },

  toggleCompare(event) {
    const id = event.currentTarget.dataset.id
    const selected = [...this.data.selectedIds]
    const index = selected.indexOf(id)
    if (index >= 0) {
      selected.splice(index, 1)
    } else {
      if (selected.length >= 2) selected.shift()
      selected.push(id)
    }

    this.setData({ selectedIds: selected })
    this.refresh()
  },

  deleteRecord(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '删除这次打卡？',
      content: '照片和记录都会从本机移除。',
      confirmText: '删除',
      confirmColor: '#b94a35',
      success: (res) => {
        if (!res.confirm) return
        storage.deleteCheckin(id)
        wx.showToast({
          title: '已删除',
          icon: 'none',
        })
        this.refresh()
      },
    })
  },
})

