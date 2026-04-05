const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const sentAudios = new Set();

module.exports = {
  command: 'az',
  category: 'media',
  description: '🎧 يرسل مقطع قرآن (صوت) عشوائي أو بصوت شيخ محدد (15-140 ثانية).',
  usage: '.اذكار [اسم الشيخ]',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const args = body.trim().split(/\s+/).slice(1);
    const query = args.join(' ');
    const searchText = query ? ` ${query}` : '';

    await sock.sendMessage(chatId, {
      react: { text: '🎧', key: msg.key }
    });

    // ✅ المحاولة الأولى: TikTok
    try {
      const { data } = await axios.get(
        `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(searchText)}`
      );
      const results = data.data;

      if (results && results.length > 0) {
        const fresh = results.filter(v =>
          v.duration &&
          v.duration >= 10 &&
          v.duration <= 190 &&
          !sentAudios.has(v.nowm)
        );

        if (fresh.length > 0) {
          fresh.sort((a, b) => (b.play || 0) - (a.play || 0));
          const aud = fresh[0];
          sentAudios.add(aud.nowm);

          return await sock.sendMessage(chatId, {
            audio: { url: aud.nowm },
            mimetype: 'audio/mp4',
            ptt: false
          }, { quoted: msg });
        }
      }
    } catch (err) {
      console.warn('*⚠️ فشل في TikTok، سيتم الانتقال إلى YouTube.*');
    }

    // ✅ المحاولة الثانية: YouTube
    try {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quran-'));
      const outPath = path.join(tmpDir, 'audio.%(ext)s');

      const command = `yt-dlp "ytsearch1:${searchText}" \
        -f "bestaudio[ext=m4a]" \
        -o "${outPath}" \
        --quiet --no-warnings \
        --match-filter "duration>=10 & duration<=140" \
        --download-sections "*0-60"`;

      execSync(command);

      const files = fs.readdirSync(tmpDir).filter(file => file.endsWith('.m4a') || file.endsWith('.mp3'));
      if (files.length === 0) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        return await sock.sendMessage(chatId, {
          text: '⚠️ لم يتم العثور على أي مقطع صوتي مناسب (10-140 ثانية).',
          quoted: msg
        });
      }

      const audioPath = path.join(tmpDir, files[0]);

      await sock.sendMessage(chatId, {
        audio: fs.readFileSync(audioPath),
        mimetype: 'audio/mp4',
        ptt: false
      }, { quoted: msg });

      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (err) {
      console.error('❌ خطأ في YouTube:', err.message);
      await sock.sendMessage(chatId, {
        text: '❌ فشل تحميل الصوت من TikTok و YouTube.\n📌 تأكد أن yt-dlp مثبت.',
        quoted: msg
      });
    }
  }
};