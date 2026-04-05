const fs = require("fs");
const path = require("path");

module.exports = {
  command: "قران",
  description: "إرسـال اسـم الـبـوت مـع فيــد قࢪآن جـمـيـل",
  category: "دين",

  async execute(sock, msg) {
    try {
      // الفيديو
      const videoPath = '/storage/emulated/0/.bot/bot/مارو/قران.mp4';
      const caption = `
*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*   

*✮ ⃟🛡️╎:「𝒀𝑨𝑴𝑨𝑻𝑶_𝒔𝒂𝒎𝒂 🕸」*

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