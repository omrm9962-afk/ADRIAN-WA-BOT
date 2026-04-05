const fs = require("fs");
const path = require("path");

module.exports = {
  command: "مارو",
  description: "إرسـال اسـم الـبـوت مـع فيــد قࢪآن جـمـيـل",
  category: "دين",

  async execute(sock, msg) {
    try {
      // الفيديو
      const videoPath = '/storage/emulated/0/.bot/bot/مارو/آيه.mp4';
      const caption = `
*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*   

*✮ ⃟🛡️╎:「𝐀𝐝𝐫𝐢𝐚𝐧 𝐍𝐨𝐫𝐭𝐡  🕸」*

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