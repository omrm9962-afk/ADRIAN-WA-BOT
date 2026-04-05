const fs = require('fs');
const path = require('path');

const pointsPath = path.join(__dirname, '../data/points.json');
const ranksPath = path.join(__dirname, '../data/ranks.json');

if (!fs.existsSync(pointsPath)) fs.writeFileSync(pointsPath, '{}');
if (!fs.existsSync(ranksPath)) fs.writeFileSync(ranksPath, '{}');

function loadJSON(file, fallback = {}) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
  return JSON.parse(fs.readFileSync(file));
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// استخراج الرقم فقط
function getNumber(jid) {
  return jid.split('@')[0];
}

// تحديد المستوى
function getLevel(points) {
  if (points >= 1000000000) return 'DEVELOPER 👑';
  if (points >= 100000000) return 'KING OF POINTS 🌀';
  if (points >= 10000000) return 'BIG BOSS 💀';
  if (points >= 1000000) return 'WTF 🔥🔥';
  if (points >= 100000) return 'KILLER 🔪🩸'; 
  if (points >= 10000) return 'LEGEND 🦁';
  if (points >= 1000) return 'PRO 💎';
  if (points >= 500) return 'advanced 🔥';
  if (points >= 200) return 'junior 🌱';
  if (points < -10) return 'noob 🪫';
  return 'junior 🌱';
}

const rewardMap = { سهل: 50, متوسط: 100, صعب: 200 };
const penaltyMap = { سهل: 50, متوسط: 100, صعب: 200 };
const timeMap = { سهل: 8000, متوسط: 13000, صعب: 18000 };

const words = {
  سهل: ['ناروتو', 'ساسكي', 'ايتاتشي', 'هيناتا', 'ساكرا', 'كاكاشي'],
  متوسط: ['ناروتو اوزوماكي', 'ساسكي أوتشيها', 'كاكاشي هاتاكي'],
  صعب: ['ناروتو اوزوماكي هوكاغي القرية', 'ساسكي أوتشيها المجنون بالانتقام']
};

module.exports = {
  command: 'كت',
  description: '⌨️ اكتب الكلمة كما هي بدون تغيير\n💡 أرسل .كت [سهل | متوسط | صعب]',
  usage: '.كتابة سهل',
  category: 'game',

  async execute(sock, m) {
    const chatId = m.key.remoteJid;
    const senderJid = m.key.participant || m.participant || m.key.remoteJid;
    const senderNum = getNumber(senderJid); // الرقم للتخزين
    const args = m.args || [];

    const validLevels = ['سهل', 'متوسط', 'صعب'];
    const inputLevel = (args?.[0] || '').trim();

    if (!validLevels.includes(inputLevel)) {
      return await sock.sendMessage(chatId, {
        text: `❌ *المستوى غير صحيح!*\nاختر:\n🟢 سهل\n🟡 متوسط\n🔴 صعب\n\nمثال: *.كت سهل*`,
        mentions: [senderJid]
      });
    }

    const levelWords = words[inputLevel];
    const word = levelWords[Math.floor(Math.random() * levelWords.length)];
    const correctAnswer = word.trim();

    await sock.sendMessage(chatId, {
      text: `⌨️ *اكتب الكلمة التالية كما هي:*\n\n*${word}*\n⏳ *${timeMap[inputLevel]/1000} ثواني*\n🙋‍♂️ اللاعب: @${senderNum}`,
      mentions: [senderJid]
    });

    const ranks = loadJSON(ranksPath, {});
    const points = loadJSON(pointsPath, {});

    let winnerFound = false;

    const handler = async ({ messages }) => {
      if (winnerFound) return;
      for (const msg of messages) {
        if (msg.key.remoteJid !== chatId) continue;
        const txt = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        if (txt.trim() === correctAnswer) {
          clearTimeout(timeout);
          sock.ev.off('messages.upsert', handler);

          const winnerJid = msg.key.participant || msg.participant || msg.key.remoteJid;
const winnerNum = getNumber(winnerJid);

          // تحديث النقاط والرتب
          ranks[winnerNum] = (ranks[winnerNum] || 0) + 1;
          points[winnerNum] = (points[winnerNum] || 0) + rewardMap[inputLevel];

          saveJSON(ranksPath, ranks);
          saveJSON(pointsPath, points);

          winnerFound = true;

          await sock.sendMessage(chatId, {
            text: `✅ *إجابة صحيحة!* 🎉\n🏆 الفائز: @${winnerNum}\n📖 الكلمة: *${word}*\n📊 نقاطك: ${points[winnerNum]} (+${rewardMap[inputLevel]})\n🎖️ رتبتك: ${getLevel(points[winnerNum])}`,
            mentions: [winnerJid] // منشن بالفائز
          });
          break;
        }
      }
    };

    sock.ev.on('messages.upsert', handler);

    const timeout = setTimeout(() => {
      if (!winnerFound) {
        sock.ev.off('messages.upsert', handler);
        points[senderNum] = (points[senderNum] || 0) - penaltyMap[inputLevel];
        saveJSON(pointsPath, points);

        sock.sendMessage(chatId, {
          text: `❌ *انتهى الوقت!* ⏰\n📖 الكلمة كانت: *${word}*\n➖ تم خصم ${penaltyMap[inputLevel]} نقطة.\n📊 نقاطك الآن: ${points[senderNum]}\n🙋‍♂️ اللاعب: @${senderNum}`,
          mentions: [senderJid]
        });
      }
    }, timeMap[inputLevel]);
  }
};