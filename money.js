// plugins/money.js
const fs = require('fs');
const path = require('path');
const { isElite } = require('../haykala/elite.js'); // نخبة بس

const bankFile = path.join(__dirname, '../bank.json');

// إنشاء الملف لو مش موجود
if (!fs.existsSync(bankFile)) {
  fs.writeFileSync(bankFile, JSON.stringify({}, null, 2));
}

function readBank() {
  return JSON.parse(fs.readFileSync(bankFile));
}

function writeBank(data) {
  fs.writeFileSync(bankFile, JSON.stringify(data, null, 2));
}

module.exports = {
  command: "فلوس",
  alias: ["money", "addmoney", "removemoney"],
  category: "economy",
  description: "إضافة أو خصم فلوس - للنخبة فقط",
  usage: ".فلوس 100+ [@منشن] | .فلوس 50- [@منشن]",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const sender = msg.key?.participant || msg.key?.remoteJid;
      const userId = sender.split('@')[0];

      // args ممكن تكون undefined
      const text = Array.isArray(args) ? args.join(" ").trim() : "";

      // السماح للنخبة فقط
      if (!isElite(userId)) {
        return sock.sendMessage(from, { text: "🚫 هذا الأمر مخصص فقط للنخبة." }, { quoted: msg });
      }

      if (!text) {
        return sock.sendMessage(from, { text: "❌ اكتب المبلغ مع + أو - مثل: .فلوس 100+ أو .فلوس 50-" }, { quoted: msg });
      }

      // إزالة المسافات + تنظيف
      const cleanText = text.replace(/\s+/g, "").trim();

      // التحقق من المبلغ + أو -
      const amountMatch = cleanText.match(/^(\d+)([+-])$/);
      if (!amountMatch) {
        return sock.sendMessage(from, { text: "❌ الصيغة غلط! لازم تكون مثل: 100+ أو 50-" }, { quoted: msg });
      }

      const amount = parseInt(amountMatch[1]);
      const operator = amountMatch[2];

      if (isNaN(amount) || amount <= 0) {
        return sock.sendMessage(from, { text: "❌ المبلغ لازم يكون رقم موجب!" }, { quoted: msg });
      }

      // تحديد الهدف (منشن / رد / نفسه)
      let targetId = userId;
      if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        targetId = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
      } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        targetId = msg.message.extendedTextMessage.contextInfo.participant.split('@')[0];
      }

      let bank = readBank();

      if (!bank[targetId]) {
        bank[targetId] = { balance: 0, level: 0 };
      }

      if (operator === "+") {
        bank[targetId].balance += amount;
      } else if (operator === "-") {
        bank[targetId].balance -= amount;
        if (bank[targetId].balance < 0) bank[targetId].balance = 0; // مفيش سالب
      }

      writeBank(bank);

      const response = targetId === userId
        ? `✅ تم ${operator === "+" ? "إضافة" : "خصم"} *${amount}* 💵 من رصيدك. رصيدك الحالي: *${bank[targetId].balance}*`
        : `✅ تم ${operator === "+" ? "إضافة" : "خصم"} *${amount}* 💵 ${operator === "+" ? "إلى" : "من"} رصيد العضو @${targetId}. رصيده الحالي: *${bank[targetId].balance}*`;

      await sock.sendMessage(from, { text: response, mentions: [targetId + '@s.whatsapp.net'] }, { quoted: msg });

    } catch (err) {
      console.error("❌ خطأ في أمر فلوس:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ حدث خطأ أثناء تنفيذ الأمر." }, { quoted: msg });
    }
  }
};