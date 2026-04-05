const fs = require("fs");
const path = require("path");

module.exports = {
  command: "اتقوا",
  description: "إرسـال اسـم الـبـوت مـع فيــد قࢪآن جـمـيـل",
  category: "دين",

  async execute(sock, msg) {
    try {
      // الفيديو
      const videoPath = '/storage/emulated/0/.bot/bot/مارو/اتقوا.mp4';
      const caption = `
*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*   

*✮ ⃟🛡️╎:「𝒀𝑨𝑴𝑨𝑻𝑶_𝒔𝒂𝒎𝒂 🕸」*
*للـتـؤؤاصـل:* https://wa.me/+201204130538?text=اهـلا+مـاࢪو🥸
*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*
`.trim();

      await sock.sendMessage(msg.key.remoteJid, {
        video: fs.readFileSync(videoPath),
        caption: caption
      }, { quoted: msg });

    } catch (err) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};