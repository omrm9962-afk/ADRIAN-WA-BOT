const fs = require('fs');
const path = require('path');
const { isElite } = require('../haykala/elite.js');

module.exports = {
  command: "منشن",
  category: "tools",
  desc: "منشن مخفي وإعادة الرسائل عند الرد (للنخبة أو المشرفين فقط)",
  usage: ".منشن",

  async execute(sock, msg, args = []) {
    try {
      const from = msg.key.remoteJid;

      if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });
      }

      // جلب بيانات المجموعة
      const groupMeta = await sock.groupMetadata(from);
      const participants = groupMeta.participants || [];

      const sender = msg.key.participant || msg.key.remoteJid;
      const senderData = participants.find(p => p.id === sender) || {};
      const isAdmin = senderData.admin === 'admin' || senderData.admin === 'superadmin';
      const isSenderElite = isElite(sender);

      if (!isAdmin && !isSenderElite) {
        return sock.sendMessage(from, { text: '🚫 هذا الأمر مسموح فقط للمشرفين أو أعضاء النخبة.' }, { quoted: msg });
      }

      const allMembers = participants.map(p => p.id);

      // التحقق من الرد على رسالة
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedMsgKey = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

      if (quoted && quotedMsgKey) {
        const forwardMsg = {
          key: {
            remoteJid: from,
            fromMe: false,
            id: quotedMsgKey,
            participant: quotedParticipant,
          },
          message: quoted
        };

        return sock.sendMessage(from, {
          forward: forwardMsg,
          mentions: allMembers
        }, { quoted: msg });
      }

      // إرسال صورة المنشن
      const imagePath = path.join(process.cwd(), 'مارو', 'منشن.jpg');
      if (!fs.existsSync(imagePath)) {
        return sock.sendMessage(from, { text: '❌ صورة المنشن غير موجودة.' }, { quoted: msg });
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const caption = `┏━━━━━『 🌹 𝑨𝒅𝒓𝒊𝒂𝒏𝑵𝒐𝒓𝒕𝒉 🌹 』━━━━━┓
     
     *♡ 𝑯𝒚𝒚 𝑮𝒖𝒚𝒔 🥷🏻♡*
┗━━━━━『 🌹 𝑨𝒅𝒓𝒊𝒂𝒏 𝑵𝒐𝒓𝒕𝒉 🌹 』━━━━━┛`;

      return sock.sendMessage(from, {
        image: imageBuffer,
        caption,
        mentions: allMembers
      }, { quoted: msg });

    } catch (err) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};