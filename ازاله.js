const fs = require('fs');
const path = require('path');

const WARN_FILE = path.join(__dirname, '..', 'data', 'warnings.json');

// تحميل التحذيرات
const loadWarns = () => {
  if (!fs.existsSync(WARN_FILE)) return {};
  return JSON.parse(fs.readFileSync(WARN_FILE));
};

// حفظ التحذيرات
const saveWarns = (data) => {
  fs.writeFileSync(WARN_FILE, JSON.stringify(data, null, 2));
};

module.exports = {
  command: 'ازاله',
  description: 'إزالة تحذير واحد من عضو معين.',
  usage: '.ازاله @منشن',
  category: 'group',

  async execute(sock, msg) {
    const groupJid = msg.key.remoteJid;
    const sender = msg.participant || msg.key.participant || msg.key.remoteJid;

    if (!groupJid.endsWith('@g.us')) {
      return sock.sendMessage(groupJid, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    const metadata = await sock.groupMetadata(groupJid);
    const admins = metadata.participants.filter(p => p.admin);
    const isAdmin = admins.find(p => p.id === sender);

    if (!isAdmin) {
      return sock.sendMessage(groupJid, { text: '❌ هذا الأمر للمشرفين فقط.' }, { quoted: msg });
    }

    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mention) {
      return sock.sendMessage(groupJid, { text: '❌ يجب منشن العضو لإزالة تحذير.' }, { quoted: msg });
    }

    const warns = loadWarns();
    if (!warns[groupJid] || !warns[groupJid][mention]) {
      return sock.sendMessage(groupJid, { text: `⚠️ @${mention.split('@')[0]} ليس لديه تحذيرات.`, mentions: [mention] }, { quoted: msg });
    }

    warns[groupJid][mention] -= 1;
    if (warns[groupJid][mention] <= 0) {
      delete warns[groupJid][mention];
    }

    saveWarns(warns);

    await sock.sendMessage(groupJid, {
      text: `✅ تم إزالة تحذير من @${mention.split('@')[0]}.\nعدد التحذيرات الحالي: ${warns[groupJid][mention] || 0}/3`,
      mentions: [mention]
    }, { quoted: msg });
  }
};