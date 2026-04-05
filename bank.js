const fs = require('fs');
const path = require('path');
const bankFile = path.join(__dirname, '../bank.json');
const eliteFile = path.join(__dirname, '../elite.json');

// إنشاء ملف البنك لو مش موجود
if (!fs.existsSync(bankFile)) fs.writeFileSync(bankFile, JSON.stringify({}, null, 2));
// إنشاء ملف النخبة لو مش موجود
if (!fs.existsSync(eliteFile)) fs.writeFileSync(eliteFile, JSON.stringify([], null, 2));

function readBank() {
  return JSON.parse(fs.readFileSync(bankFile));
}

function writeBank(data) {
  fs.writeFileSync(bankFile, JSON.stringify(data, null, 2));
}

function readElite() {
  return JSON.parse(fs.readFileSync(eliteFile));
}

module.exports = {
  command: "بنك",
  category: "economy",
  description: "🏦 عرض رصيدك أو رصيد الآخرين",
  usage: ".بنك | .بنك @منشن | .بنك نخبة",

  async execute(sock, msg, args) {
    try {
      args = args || []; // ✅ ضمان أن args دايمًا Array
      const chatId = msg.key.remoteJid;
      const sender = msg.key?.participant || msg.key?.remoteJid;
      const senderId = sender.split('@')[0];
      let bank = readBank();
      const eliteNumbers = readElite();

      // =============================
      // تحديد العضو المستهدف
      // =============================
      let targetId = senderId;
      const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};

      if (Array.isArray(contextInfo.mentionedJid) && contextInfo.mentionedJid.length > 0) {
        targetId = contextInfo.mentionedJid[0].split('@')[0];
      } else if (contextInfo.participant) {
        targetId = contextInfo.participant.split('@')[0];
      }

      // =============================
      // لو كتب "نخبة"
      // =============================
      if (args.length > 0 && args[0]?.toLowerCase() === "نخبة") {
        let text = "👑 *أرصدة النخبة:*\n\n";
        eliteNumbers.forEach(num => {
          if (!bank[num]) bank[num] = { balance: 0, items: [] };
          text += `• ${num}: ${bank[num].balance} 💵\n`;
        });
        writeBank(bank);
        return sock.sendMessage(chatId, { text }, { quoted: msg });
      }

      // =============================
      // التأكد من وجود حساب للعضو
      // =============================
      if (!bank[targetId]) bank[targetId] = { balance: 0, items: [] };
      const userBalance = bank[targetId].balance;

      // =============================
      // الرد النهائي
      // =============================
      let responseText;
      if (targetId === senderId) {
        responseText = `🏦 *رصيدك الحالي:*\n💰 ${userBalance} 💵`;
      } else {
        responseText = `🏦 *رصيد العضو @${targetId}:*\n💰 ${userBalance} 💵`;
      }

      await sock.sendMessage(
        chatId,
        { text: responseText, mentions: [`${targetId}@s.whatsapp.net`] },
        { quoted: msg }
      );

      writeBank(bank);

    } catch (err) {
      console.error("✗ خطأ في تنفيذ أمر بنك:", err);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ حصل خطأ أثناء معالجة الأمر." },
        { quoted: msg }
      );
    }
  }
};