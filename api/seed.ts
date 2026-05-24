import Database from 'better-sqlite3'
import { nanoid } from 'nanoid'

const db = new Database('./whisperbox.db')
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const userId = nanoid(10)
db.prepare('INSERT INTO users (id, phone, nickname, created_at) VALUES (?, ?, ?, ?)').run(
  userId, '13800138000', '月光旅人', Date.now()
)

const whispers = [
  '有时候我在想，如果当初勇敢一点，现在的人生会不会完全不一样。',
  '其实我每天都很焦虑，但在所有人面前，我必须看起来很好。',
  '我偷偷喜欢了我最好的朋友三年了，从来没有告诉过任何人。',
  '今天终于辞职了。做了五年不喜欢的工作，今天是我最勇敢的一天。',
  '爸妈，对不起，我不是你们想象中的那个完美孩子。',
  '深夜三点，我给五年没联系的人发了消息，然后又撤回了。',
  '感谢楼下早餐店阿姨，每次都多给我加一个蛋。',
  '我想开一家自己的咖啡店，里面有书架，有猫，有永远播放的爵士乐。',
  '每次看到朋友圈里大家都过得很好，我就觉得自己是个失败者。',
  '我今年三十岁了，还没有谈过恋爱。不是不想，是不知道怎么开始。',
  '今天在地铁上看到一个老人给另一个老人让座，突然觉得这个世界还没那么糟。',
  '我原谅你了，但我再也不想见到你了。这两件事不矛盾。',
  '小时候以为长大就可以自由了，长大后才发现小时候才是最自由的。',
  '一个人去医院做手术的那天，我在候诊室里偷偷哭了。',
  '我在日记本里写满了不敢发给你的话。',
  '其实我并不恨你，我只是恨那个拼命爱你的自己。',
  '没有人知道我在深夜哭过多少次。白天我还是那个爱笑的人。',
  '今天鼓起勇气和妈妈说了一句我爱你。她说，我知道，傻孩子。',
  '我害怕的不是变老，而是变老的时候身边一个人都没有。',
  '去年许的愿望，今年实现了一半。希望明年能实现另一半。',
]

for (const content of whispers) {
  const id = nanoid(12)
  db.prepare(
    'INSERT INTO whispers (id, user_id, content, like_count, dislike_count, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    userId,
    content,
    Math.floor(Math.random() * 20),
    Math.floor(Math.random() * 5),
    Date.now() - Math.floor(Math.random() * 86400000 * 7)
  )
}

console.log('Seed data inserted: ' + whispers.length + ' whispers')
db.close()