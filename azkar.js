const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const sentVideos = new Set();

module.exports = {
  command: 'اذكار',
  category: 'media',
  description: '🎧 يرسل مقطع قرآن عشوائي أو بصوت شيخ محدد من TikTok أو YouTube (15-60 ثانية).',
  usage: '.اذكار [اسم الشيخ]',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const args = body.trim().split(/\s+/).slice(1);
    const query = args.join(' ');
    const searchText = query ? `quran ${query}` : 'quran';

    await sock.sendMessage(chatId, {
      react: { text: '📖', key: msg.key }
    });

    // المحاولة الأولى: TikTok
    try {
      const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(searchText)}`);
      const results = data.data;

      if (results && results.length > 0) {
        // فلترة الفيديوهات القصيرة فقط بين 15 ثانية ودقيقة
        const fresh = results.filter(v => 
          !sentVideos.has(v.nowm) &&
          v.duration >= 15 && v.duration <= 80
        );

        if (fresh.length > 0) {
          fresh.sort((a, b) => (b.play || 0) - (a.play || 0));
          const vid = fresh[0];
          sentVideos.add(vid.nowm);

          return await sock.sendMessage(chatId, {
            video: { url: vid.nowm },
            caption: `*❐┃ 𝗧𝗵𝗲 𝗼𝗿𝗱𝗲𝗿 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 ┃✅*\n\n📖 *القرآن:* ${query || '𝗥𝗔𝗡𝗗𝗢𝗠'}`
          }, { quoted: msg });
        }
      }
    } catch (err) {
      console.warn('*فشل في TikTok، سيتم الانتقال إلى YouTube.*');
    }

    // المحاولة الثانية: YouTube
    try {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quran-'));
      const outPath = path.join(tmpDir, 'video.%(ext)s');

      // yt-dlp مع فلترة مدة الفيديوهات
      const command = `yt-dlp "ytsearch1:${searchText}" -f mp4 -o "${outPath}" --quiet --no-warnings --match-filter "duration>=15 & duration<=80"`;
      execSync(command);

      const files = fs.readdirSync(tmpDir).filter(file => file.endsWith('.mp4'));
      if (files.length === 0) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        return await sock.sendMessage(chatId, {
          text: '⚠️ لم يتم العثور على أي مقطع قرآن مناسب.',
          quoted: msg
        });
      }

      const videoPath = path.join(tmpDir, files[0]);

      await sock.sendMessage(chatId, {
        video: fs.readFileSync(videoPath),
        caption: `*❐┃𝗧𝗵𝗲 𝗼𝗿𝗱𝗲𝗿 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗶𝗻 YouTube┃✅*\n\n📖 *القرآن:* ${query || '𝗥𝗔𝗡𝗗𝗢𝗠'}`
      }, { quoted: msg });

      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (err) {
      console.error('❌ خطأ في YouTube:', err.message);
      await sock.sendMessage(chatId, {
        text: '❌ فشل تحميل المقطع من TikTok و YouTube.\n📌 تأكد أن yt-dlp مثبت.',
        quoted: msg
      });
    }
  }
};