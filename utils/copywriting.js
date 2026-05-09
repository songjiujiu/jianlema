const copywriting = {
  daily: {
    gentle: [
      '记录一下吧，改变都是从面对开始的。',
      '今天不用完美，但别消失。',
      '把今天拍下来，明天会感谢你。',
    ],
    sharp: [
      '你可以骗小程序，但骗不了裤腰。',
      '别躲了，拍一张，看看今天有没有认真。',
      '嘴上说改变，今天的证据呢？',
    ],
    hell: [
      '别把目标挂嘴上，把今天的打卡交出来。',
      '连一张照片都不敢拍，怎么指望身材听你的？',
      '今天不记录，明天继续假装重新开始？',
    ],
  },
  missed_checkin: {
    gentle: [
      '今天还没打卡，别让昨天的努力白费。',
      '不需要完美复盘，先把记录补上。',
      '断了一次没关系，别让断点变成终点。',
    ],
    sharp: [
      '又想假装没这回事？体重秤可不会陪你演。',
      '今天没打卡，懒惰已经替你签到了。',
      '别躲了，裤腰比任何人都诚实。',
    ],
    hell: [
      '你不是没时间，你是在给放弃找台阶。',
      '今天又输给嘴和懒了？现在打卡还来得及。',
      '目标不是摆设，把今天欠的打卡补上。',
    ],
  },
  success: {
    gentle: [
      '打卡完成，今天没有失约。',
      '很好，改变又多了一条证据。',
      '记录已存下，继续往目标靠近。',
    ],
    sharp: [
      '行，今天算你没偷懒。',
      '证据交上来了，继续保持。',
      '今天的自己没有跑路，漂亮。',
    ],
    hell: [
      '过关。明天别掉链子。',
      '今天保住了，下一关继续。',
      '这才像个想改变的人。',
    ],
  },
}

function getCopy(scene = 'daily', mode = 'sharp') {
  const sceneCopy = copywriting[scene] || copywriting.daily
  const list = sceneCopy[mode] || sceneCopy.sharp || sceneCopy.gentle
  const index = Math.floor(Math.random() * list.length)
  return list[index]
}

module.exports = {
  copywriting,
  getCopy,
}

