module.exports = {
  command: 'اضافة',
  description: '📱 إضافة عضو جديد إلى الجروب باستخدام رقمه',
  usage: '.اضافة <رقم>',
  category: 'group',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    // 🔹 تأكد إن الأمر داخل جروب
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: "❌ هذا الأمر يعمل فقط داخل الجروبات." }, { quoted: msg });
    }

    // 🔹 تأكد إن في رقم مكتوب
    if (args.length === 0) {
      return sock.sendMessage(chatId, { text: "⚠️ استخدم الأمر كده:\n.اضافة 2010xxxxxxx" }, { quoted: msg });
    }

    // 🔹 الرقم المُدخل
    let number = args[0].replace(/[^0-9]/g, ""); // ينظف الرقم
    if (!number.startsWith("2") && !number.startsWith("1")) {
      number = "2" + number; // يضيف كود الدولة لو ناقص
    }

    const userJid = `${number}@s.whatsapp.net`;

    try {
      // 🔹 محاولة الإضافة
      await sock.groupParticipantsUpdate(chatId, [userJid], "add");
      await sock.sendMessage(chatId, { text: `✅ تم إرسال دعوة إلى @${number}` }, { quoted: msg, mentions: [userJid] });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(chatId, { text: `❌ فشل إضافة العضو:\n${err.message}` }, { quoted: msg });
    }
  }
};