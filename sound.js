const fs = require("fs");
const path = require("path");

module.exports = {
  command: "ساوند",
  description: "يبعت معلومات البوت + صورة + ساوند",
  category: "tools",

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;

      // مسارات الملفات
      const imagePath = path.join(__dirname, "..", "مارو", "bot.jpg");
      const audioPath = path.join(__dirname, "..", "مارو", "sound.mp3");

      // الرسالة
      const caption = `
*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*    
*✮ ⃟🛡️╎:「#Adrian North」*

*✮ ⃟🛡️╎: 201204130538 ↯↯ 
*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*
      `.trim();

      // تحقق من الملفات
      if (!fs.existsSync(imagePath)) {
        return sock.sendMessage(chatId, { text: "❌ الصورة bot.jpg مش موجودة." }, { quoted: msg });
      }
      if (!fs.existsSync(audioPath)) {
        return sock.sendMessage(chatId, { text: "❌ الصوت sound.mp3 مش موجود." }, { quoted: msg });
      }

      // أول رسالة: صورة + كابشن
      await sock.sendMessage(chatId, {
        image: { url: imagePath },
        caption
      }, { quoted: msg });

              // ملف الصوت
                   
                    const groupLink = "https://chat.whatsapp.com/JIsQuBqzjWP1tWOpubvy6f?mode=gi_t";

                    if (fs.existsSync(audioPath)) {
                        await sock.sendMessage(
                            message.key.remoteJid,
                            {
                                audio: { url: audioPath },
                                mimetype: "audio/mpeg",
                                ptt: true, // لـو علق خـلـيـه false.. 
                                contextInfo: {
                                    externalAdReply: {
                                        title: "𝒀𝑨𝑴𝑨𝑻𝑶 𓂀",
                                        body: "𝑭𝑼𝑪𝑲 𝒀𝑶𝑼",
                                        mediaType: 1,
                                        thumbnail: thumbBuffer,
                                        showAdAttribution: true,
                                        sourceUrl: groupLink
                                    }
                                }
                            },
                            { quoted: message }
                        ).catch(()=>{});
                    } else {
                        logger.warn("⚠️ ملف الصوت ../مارو/𝐌𝐀𝐑𝐎.mp3 غير موجود.");
                     }

    } catch (err) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};