const dateUtil = require('../../utils/date')
const storage = require('../../utils/storage')
const { getCopy } = require('../../utils/copywriting')

const moodOptions = [
  { label: '稳住', value: '稳住' },
  { label: '想吃', value: '想吃' },
  { label: '很行', value: '很行' },
]

Page({
  data: {
    checkinDate: '',
    displayDate: '',
    imagePath: '',
    weight: '',
    note: '',
    mood: '',
    moods: moodOptions,
    isMakeup: false,
  },

  onLoad(options = {}) {
    const today = dateUtil.formatDate()
    const checkinDate = options.date || today
    const isMakeup = options.makeup === '1' || checkinDate !== today
    this.setData({
      checkinDate,
      displayDate: dateUtil.displayDate(checkinDate),
      isMakeup,
    })
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({
      [field]: event.detail.value,
    })
  },

  selectMood(event) {
    const mood = event.currentTarget.dataset.value
    this.setData({
      mood,
      moods: moodOptions.map((item) => ({
        ...item,
        active: item.value === mood,
      })),
    })
  },

  choosePhoto() {
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera', 'album'],
        success: (res) => {
          const file = res.tempFiles && res.tempFiles[0]
          if (file && file.tempFilePath) this.persistImage(file.tempFilePath)
        },
      })
      return
    }

    wx.chooseImage({
      count: 1,
      sourceType: ['camera', 'album'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0]
        if (path) this.persistImage(path)
      },
    })
  },

  persistImage(tempFilePath) {
    wx.saveFile({
      tempFilePath,
      success: (res) => {
        this.setData({ imagePath: res.savedFilePath })
      },
      fail: () => {
        this.setData({ imagePath: tempFilePath })
      },
    })
  },

  submitCheckin() {
    if (!this.data.imagePath) {
      wx.showToast({
        title: '先拍一张',
        icon: 'none',
      })
      return
    }

    const weight = this.data.weight ? Number(this.data.weight) : ''
    if (this.data.weight && Number.isNaN(weight)) {
      wx.showToast({
        title: '体重填数字',
        icon: 'none',
      })
      return
    }

    const record = storage.addCheckin({
      checkinDate: this.data.checkinDate,
      imagePath: this.data.imagePath,
      weight,
      mood: this.data.mood,
      note: this.data.note.trim(),
      isMakeup: this.data.isMakeup,
    })

    const profile = storage.getProfile()
    storage.saveProfile({
      ...profile,
      currentWeight: weight || profile.currentWeight,
      startWeight: profile.startWeight || weight || '',
      onboarded: true,
    })

    wx.showToast({
      title: getCopy('success', profile.reminderMode),
      icon: 'none',
      duration: 1200,
    })

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }, 900)

    return record
  },
})

