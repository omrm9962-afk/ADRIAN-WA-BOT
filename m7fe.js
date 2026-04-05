module.exports = {
  command: "مخفي",
  description: "إرسال رسالة مخفية + منشن لكل الأعضاء بدون ظهور الأسماء",
  usage: ".مخفي <النص>",
  async execute(sock, msg, args) {
    try {
      const text = args.join(" ").trim();
      if (!text) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ اكتب الرسالة بعد الأمر.\nمثال: .مخفي بحبكم 🐦"
        });
        return;
      }

      const chatId = msg.key.remoteJid;

      // 🧹 حذف رسالة المستخدم الأصلية (اختياري)
      try {
        await sock.sendMessage(chatId, { delete: msg.key });
      } catch (err) {
        console.log("⚠️ فشل حذف الرسالة الأصلية (مش ضروري):", err.message);
      }

      // 💬 جلب أعضاء الجروب
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants.map(p => p.id); // كل الأعضاء

      // 💬 إرسال الرسالة مع منشن مخفي
      await sock.sendMessage(chatId, {
        text: text,
        contextInfo: {
          mentionedJid: participants // منشن لكل الأعضاء
        }
      });

    } catch (err) {
      console.error("❌ خطأ في أمر مخفي:", err);
      try {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "⚠️ حصل خطأ أثناء تنفيذ الأمر مخفي."
        });
      } catch {}
    }
  }
};