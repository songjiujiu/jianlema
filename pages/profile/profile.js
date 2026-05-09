const storage = require('../../utils/storage')

const modeLabels = {
  gentle: '温和',
  sharp: '犀利',
  hell: '地狱',
}

const modeOptions = [
  {
    name: '温和模式',
    value: 'gentle',
    desc: '提醒你回来记录，不攻击人，适合长期使用。',
  },
  {
    name: '犀利模式',
    value: 'sharp',
    desc: '嘴上不客气，但只盯行为和借口。',
  },
  {
    name: '地狱模式',
    value: 'hell',
    desc: '更狠一点，开启前先确认自己吃得住。',
  },
]

Page({
  data: {
    profile: {},
    modes: [],
    modeLabel: '',
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const profile = storage.getProfile()
    this.setData({
      profile,
      modeLabel: modeLabels[profile.reminderMode] || '犀利',
      modes: modeOptions.map((item) => ({
        ...item,
        active: item.value === profile.reminderMode,
      })),
    })
  },

  onProfileInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({
      [`profile.${field}`]: event.detail.value,
    })
  },

  onPopupSwitch(event) {
    this.setData({
      'profile.reminderPopupEnabled': event.detail.value,
    })
  },

  selectMode(event) {
    const mode = event.currentTarget.dataset.mode
    if (mode !== 'hell') {
      this.updateMode(mode)
      return
    }

    wx.showModal({
      title: '开启地狱模式？',
      content: '这档文案会更犀利，但仍然只针对行为，不做人身攻击。',
      confirmText: '我吃得住',
      success: (res) => {
        if (res.confirm) this.updateMode(mode)
      },
    })
  },

  updateMode(mode) {
    this.setData({
      'profile.reminderMode': mode,
      modeLabel: modeLabels[mode],
      modes: modeOptions.map((item) => ({
        ...item,
        active: item.value === mode,
      })),
    })
  },

  saveSettings() {
    const profile = storage.saveProfile(this.data.profile)
    this.setData({ profile })
    wx.showToast({
      title: '已保存',
      icon: 'none',
    })
  },

  clearData() {
    wx.showModal({
      title: '清空全部数据？',
      content: '本机的资料、打卡照片记录和弹窗记录都会清掉。',
      confirmText: '清空',
      confirmColor: '#b94a35',
      success: (res) => {
        if (!res.confirm) return
        storage.clearAll()
        wx.showToast({
          title: '已清空',
          icon: 'none',
        })
        this.refresh()
      },
    })
  },
})

