const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const sentVideos = new Set();

module.exports = {
  command: 'ايديت',
  category: 'media',
  description: 'يرسل أفضل Anime Edit من كل مواقع التواصل.',
  usage: '.ايديت [اسم الأنمي]',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const body =
      msg.message?.extendedTextMessage?.text ||
      msg.message?.conversation ||
      '';

    const args = body.trim().split(/\s+/).slice(1);
    const query = args.join(' ');
    const searchText = query ? `anime edit ${query}` : 'anime edit';

    await sock.sendMessage(chatId, {
      react: { text: '🎬', key: msg.key }
    });

    /* =======================
       TikTok (API)
    ======================= */
    try {
      const { data } = await axios.get(
        `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(searchText)}`
      );

      const results = data?.data;

      if (Array.isArray(results) && results.length) {
        const fresh = results.filter(v => v.nowm && !sentVideos.has(v.nowm));

        if (fresh.length) {
          fresh.sort((a, b) => (b.play || 0) - (a.play || 0));
          const vid = fresh[0];
          sentVideos.add(vid.nowm);

          return await sock.sendMessage(
            chatId,
            {
              video: { url: vid.nowm },
              caption:
                `*❒┃ 𝙏𝙃𝙀 𝙎𝙀𝘼𝙍𝘾𝙃 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇  ❄ ┃✅*\n\n` +
                `🎬 *𝙎𝙀𝘼𝙍𝘾𝙃:* ${query || '*𝑹𝑨𝑵𝑫𝑶𝑴🔀*'}\n` +
                `*➸ 𝚈𝙰𝙼𝙰𝚃𝙾 𝙱𝙾𝚃..*`
            },
            { quoted: msg }
          );
        }
      }
    } catch (e) {
      console.warn('⚠️ TikTok فشل – التحويل إلى Chrome / yt-dlp');
    }

    /* =======================
       Chrome (YouTube / Instagram / Facebook / Pinterest / إلخ)
       yt-dlp بيدعمهم كلهم
    ======================= */
    try {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edit-'));
      const output = path.join(tmpDir, 'video.%(ext)s');

      const cmd =
        `yt-dlp "ytsearch1:${searchText}" ` +
        `-f mp4 ` +
        `-o "${output}" ` +
        `--no-playlist --quiet --no-warnings`;

      execSync(cmd);

      const files = fs.readdirSync(tmpDir).filter(f => f.endsWith('.mp4'));
      if (!files.length) throw new Error('No video');

      const videoPath = path.join(tmpDir, files[0]);

      await sock.sendMessage(
        chatId,
        {
          video: fs.readFileSync(videoPath),
          caption:
            `* تم ┃ تنفيذ البحث في Chrome ┃✅*\n\n` +
            `🌐 *المصدر:* YouTube / Instagram / Facebook / Pinterest\n` +
            `🎬 *ايديت:* ${query || 'عشوائي'}`
        },
        { quoted: msg }
      );

      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (err) {
      console.error('❌ فشل التحميل:', err.message);
      await sock.sendMessage(
        chatId,
        {
          text:
            '❌ فشل تحميل الفيديو من كل المصادر.\n' +
            '📌 تأكد أن yt-dlp مثبت ويعمل على السيرفر.',
        },
        { quoted: msg }
      );
    }
  }
};