const axios = require('axios'); 
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const sentVideos = new Set();

module.exports = {
  command: 'تيك',
  category: 'media',
  description: 'يرسل فيد حسب طلبك من التيك توك او اليوتيوب.',
  usage: '.تيك [البحث التي تريده]',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const args = body.trim().split(/\s+/).slice(1);
    const query = args.join(' ');
    const searchText = query ? ` ${query}` : '';

    await sock.sendMessage(chatId, {
      react: { text: '🎬', key: msg.key }
    });

    // المحاولة الأولى: TikTok API
    try {
      const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(searchText)}`);
      const results = data.data;

      if (results && results.length > 0) {
        const fresh = results.filter(v => !sentVideos.has(v.nowm));
        if (fresh.length > 0) {
          fresh.sort((a, b) => (b.play || 0) - (a.play || 0));
          const vid = fresh[0];
          sentVideos.add(vid.nowm);

          return await sock.sendMessage(chatId, {
            video: { url: vid.nowm },
            caption: `❒┃ *𝑺𝑼𝑪𝑪𝑬𝑺𝑺𝑭𝑼𝑳 𝙎𝙀𝘼𝙍𝘾𝙃 𝙄𝙉 𝙏𝙄𝙆𝙏𝙊𝙆 ❄*\n\n🎬 *𝙎𝙀𝘼𝙍𝘾𝙃:* ${query || '*𝑹𝑨𝑵𝑫𝑶𝑴*'}\n*➸ 𝑨𝒅𝒓𝒊𝒂𝒏 𝘽𝙊𝙏..*`
          }, { quoted: msg });
        }
      }
    } catch (err) {
      console.warn('*فشل في TikTok، سيتم الانتقال إلى YouTube.*');
    }

    // المحاولة الثانية: YouTube yt-dlp
    try {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edit-'));
      const outPath = path.join(tmpDir, 'video.%(ext)s');
      const command = `yt-dlp "ytsearch1:${searchText}" -f mp4 -o "${outPath}" --quiet --no-warnings`;
      execSync(command);

      const files = fs.readdirSync(tmpDir).filter(file => file.endsWith('.mp4'));
      if (files.length === 0) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        return await sock.sendMessage(chatId, {
          text: '⚠️ 𝑫𝑶𝑵𝑶𝑻 𝑭𝑰𝑵𝑫 𝑽𝑰𝑫𝑺.',
          quoted: msg
        });
      }

      const videoPath = path.join(tmpDir, files[0]);

      await sock.sendMessage(chatId, {
        video: fs.readFileSync(videoPath),
        caption: `*❒┃𝑺𝑼𝑪𝑪𝑬𝑺𝑺𝑭𝑼𝑳 𝙄𝙉 𝙔𝙊𝙐𝙏𝙐𝙋𝙀 ❄ ┃✅*\n\n🎬 *𝙎𝙀𝘼𝙍𝘾𝙃:* ${query || '*𝑹𝑨𝑵𝑫𝑶𝑴*'}\n*➸ 𝑨𝒅𝒓𝒊𝒂𝒏 𝘽𝙊𝙏..*`
      }, { quoted: msg });

      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (err) {
      console.error('❌ 𝐄𝐑𝐑𝐎𝐑 𝐈𝐍  YouTube:', err.message);
      await sock.sendMessage(chatId, {
        text: '❌ 𝑬𝑹𝑹𝑶𝑹 𝑫𝑶𝑾𝑵𝑳𝑶𝑨𝑫 𝑽𝑰𝑫  𝙏𝙄𝙆𝙏𝙊𝙆 , 𝙔𝙊𝙐𝙏𝙐𝙋𝙀.\n📌 𝑺𝑼𝑹𝑬 𝑨𝑻.. yt-dlp 𝑰𝑵𝑺𝑻𝑨𝑳𝑳𝑬𝑫.',
        quoted: msg
      });
    }
  }
};