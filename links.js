const fs = require("fs");

module.exports = {
  command: 'بانكاي',
  description: 'امر تستخدمه عشان تنشر لينكات وسلسلة جروبات 𝙺𝙾𝙽𝙾𝙷𝙰 💫',
  usage: '.بانكاي',
  category: 'others',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    // 🔹 رياكت على الأمر ⚡
    await sock.sendMessage(chatId, { react: { text: '⚡', key: msg.key } });

    // 🔹 مسار الصورة
    const imagePath = path.join(__dirname, '..', 'مارو', '𝐌𝐀𝐑𝐎.jpg');
    if (!fs.existsSync(imagePath)) {
      return sock.sendMessage(chatId, { text: "⚠️ ملف الصورة غير موجود." }, { quoted: msg });
    }

    // 🔹 النص اللي هيتبعت
    const customText = `
◆ ▰▰▰▰ ❴🌙❵ ▰▰▰▰ ◆
*⊰ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐌𝐘 𝐒𝐇𝐎𝐖 ⊱*
*𝑳𝒊𝒏𝒌 ↯↯*
*『 https://chat.whatsapp.com/JIsQuBqzjWP1tWOpubvy6f?mode=gi_t 』*
*#Adrian North - 𝐒𝐇𝐎𝐖 ⋆𐙚 ̊.*

*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*
*🌙 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐌𝐘 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 🌙*
*𝑳𝒊𝒏𝒌 ↯↯*
*『 https://whatsapp.com/channel/0029Vb6e0fb4o7qHwvCVsK1t 』*
*𝒀𝑨𝑴𝑨𝑻𝑶 𝑩𝑶𝑻 ⋆𐙚 ̊.*

*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*
*🌇 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐌𝐘 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 🌇*
*𝑳𝒊𝒏𝒌 ↯↯*
https://t.me/konoha_kelwa 
*𝑲𝑶𝑵𝑶𝑯𝑨 — يـامـاتــو ⋆𐙚 ̊.*


*↯↯ 𝐌𝐀𝐑𝐎 ® ↯↯*
◆ ▰▰▰▰ ❴🌙❵ ▰▰▰▰ ◆
`;

    // 🔹 إرسال الصورة مع النص
    await sock.sendMessage(
      chatId,
      {
        image: { url: imagePath },
        caption: customText,
      },
      { quoted: msg }
    );
  }
};