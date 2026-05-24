import { nanoid } from 'nanoid'
import db from '../database.js'

const REPLY_TEMPLATES = [
  '听到你的声音了。无论你在经历什么，我想告诉你：你并不孤单。🕯️',
  '谢谢你愿意把这些话说出来。有时候，仅仅是倾诉，就已经是巨大的勇气了。✨',
  '读到这条低语的时候，我感觉到了你的温度。愿你被这个世界温柔以待。🌙',
  '有些话，说出来比藏在心里好。你做得很好，真的。🤗',
  '感同身受。也许我们素不相识，但在这一刻，我想陪着你。💙',
  '每个人都有属于自己的秘密花园。感谢你愿意打开一扇窗，让我看到里面的风景。🌸',
  '生命中有太多无法言说的瞬间，但看见你的文字，我觉得一切都可以被理解。',
  '请相信，黑夜过后总会有光。你的故事值得被倾听，也值得一个温暖的回应。🌟',
  '我不敢说完全懂你，但我在认真地听。每一个字，每一句话，都没有被辜负。',
  '你知道吗？在读到你的低语之前，我以为只有我一个人这样想。谢谢你让我觉得不再孤独。🫂',
  '生活有时候确实很难，但你已经走了这么远，真的很了不起。',
  '看到这条低语，我想对你说：没关系的，一切都会好起来的。不是安慰，是真心话。',
]

const KEYWORD_MAP: Record<string, string[]> = {
  '爱': ['爱情有时候就是这样，说不清道不明。但能被你写下来，已经是一种释然了。💔', '爱与被爱，都是需要练习的事。你很好，值得被好好爱着。'],
  '焦虑': ['焦虑不是你的错。这是身体在告诉你需要休息一下，给自己一点空间。', '深呼吸，慢慢来。你正在处理的事情，远比你以为的要勇敢。'],
  '辞职': ['恭喜你迈出了这一步！改变是恐惧的来源，但也是成长的开始。新的旅程在前方等你。🌟', '断舍离需要巨大的勇气。你已经做到了最难的部分，接下来的人生会有不一样的风景。'],
  '妈妈': ['妈妈永远是这个世界上最懂你的人。即使什么都不说，她也知道。', '亲情有时候是最难以表达的，但你写下来的话，她一定能感受到。'],
  '朋友': ['真正的友情经得起时间的考验。那些默默存在的关心，比言语更有力量。', '有一个可以偷偷喜欢的朋友，其实也是一种幸福呢。'],
  '孤独': ['孤独是成长的必修课。但请记住，这一刻有人在认真读你的话，你不孤单。', '每个人都是一座孤岛，但文字是连接岛屿的桥梁。感谢你架起了这座桥。'],
  '变老': ['变老是一件很优雅的事。每一道皱纹都是你走过的路，见证了你所有的故事。', '年龄从来不是问题，重要的是每一岁你都活成了自己想要的样子。'],
  '勇敢': ['勇敢不是不害怕，而是害怕之后依然选择前进。你已经很棒了！'],
  '希望': ['希望是黑暗中最亮的光。保持这份光亮，它会照亮你前行的路。'],
  '梦': ['梦想从来不怕实现不了，怕的是不敢去想。你已经踏出了第一步——写下来。💭'],
  '哭': ['哭泣不是软弱，是心灵在排毒。哭过之后，天还是会亮的。', '深夜的眼泪最真实。你不需要在所有人面前都那么坚强，在这里，你可以脆弱。'],
  '原谅': ['原谅别人是一种能力，原谅自己是一种智慧。你做得很好。'],
  '自由': ['自由从来不是别人给的，是自己选择的。你已经找到了答案。'],
}

function pickReply(content: string): string {
  const lower = content.toLowerCase()
  for (const [keyword, replies] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      const reply = replies[Math.floor(Math.random() * replies.length)]
      if (Math.random() < 0.7) return reply
    }
  }
  return REPLY_TEMPLATES[Math.floor(Math.random() * REPLY_TEMPLATES.length)]
}

export function runAiReplyTask() {
  const count = 1 + Math.floor(Math.random() * 3)

  const whispers = db.prepare(`
    SELECT w.* FROM whispers w
    WHERE w.content != '' AND NOT EXISTS(SELECT 1 FROM ai_replies WHERE whisper_id = w.id)
    ORDER BY RANDOM() LIMIT ?
  `).all(count) as any[]

  for (const whisper of whispers) {
    const replyContent = pickReply(whisper.content)
    db.prepare('INSERT INTO ai_replies (id, whisper_id, content, created_at) VALUES (?, ?, ?, ?)').run(
      nanoid(10), whisper.id, replyContent, Date.now()
    )
    console.log(`[AI] 回复了低语 ${whisper.id.slice(0, 6)}... -> "${replyContent.slice(0, 20)}..."`)
  }

  if (whispers.length > 0) {
    console.log(`[AI] 本轮共回复 ${whispers.length} 条低语`)
  }
}