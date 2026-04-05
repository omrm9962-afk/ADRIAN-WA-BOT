const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const sentDataFile = path.join(__dirname, 'sent_media.json');
let sentMedia = { videos: [], images: [] };

if (fs.existsSync(sentDataFile)) {
  try {
    sentMedia = JSON.parse(fs.readFileSync(sentDataFile, 'utf8'));
  } catch {
    sentMedia = { videos: [], images: [] };
  }
}

function saveSentMedia() {
  fs.writeFileSync(sentDataFile, JSON.stringify(sentMedia, null, 2));
}

async function searchTikTok(query) {
  try {
    const { data } = await axios.get(
      `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`
    );
    return data?.data || [];
  } catch {
    return [];
  }
}

async function searchPexelsImage(query) {
  try {
    const { data } = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15`, {
      headers: { Authorization: '563492ad6f917000010000013b8f1a91e7d24a5b90a8c2f24a5e3c85' } // API KEY مجانية من Pexels
    });
    return data.photos || [];
  } catch {
    return [];
  }
}

module.exports = {
  command: 'boo',
  category: 'media',
  description: 'يرسل صورة أو فيديو رعب قوي جداً من TikTok أو YouTube أو Pexels.',
  usage: '.boo صورة | .boo فيديو',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const args = body.trim().split(/\s+/).slice(1);

    const first = (args[0] || '').toLowerCase();
    const isImageCmd = first === 'صورة' || first === 'صوره';
    const isVideoCmd = first === 'فيديو' || first === 'ڤيديو';

    const queryParts = (isImageCmd || isVideoCmd) ? args.slice(1) : args;

    const strongWords = 'extreme horror gore scary disturbing bloody haunted demon ghost possessed cursed jumpscare paranormal terrifying killer ritual exorcism nightmare';
    const lightWords = 'horror scary creepy nightmare';
    const queryStrong = `${strongWords} ${queryParts.join(' ')}`;
    const queryLight = `${lightWords} ${queryParts.join(' ')}`;
    const mode = isImageCmd ? 'image' : 'video';

    await sock.sendMessage(chatId, { react: { text: '🩸', key: msg.key } });

    let results = await searchTikTok(queryStrong);
    if (results.length === 0) results = await searchTikTok(queryLight);

    if (mode === 'image') {
      let freshImgs = results.filter(v => v?.cover && !sentMedia.images.includes(v.cover));
      if (freshImgs.length > 0) {
        const pic = freshImgs[Math.floor(Math.random() * freshImgs.length)];
        sentMedia.images.push(pic.cover);
        saveSentMedia();
        return await sock.sendMessage(chatId, {
          image: { url: pic.cover },
          caption: `🩸 *صورة رعب قوية!* 👀\n☠️ ${queryParts.join(' ') || '𝐘𝐚𝐦𝐚𝐭𝐨 ┇🍁┇'}`
        }, { quoted: msg });
      }

      // fallback Pexels
      let pexelsImgs = await searchPexelsImage(queryParts.join(' ') || 'scary horror');
      let freshPexels = pexelsImgs.filter(img => img?.src?.original && !sentMedia.images.includes(img.src.original));
      if (freshPexels.length > 0) {
        const pic = freshPexels[Math.floor(Math.random() * freshPexels.length)];
        sentMedia.images.push(pic.src.original);
        saveSentMedia();
        return await sock.sendMessage(chatId, {
          image: { url: pic.src.original },
          caption: `🩸 *صورة رعب قوية!* 👀\n☠️ ${queryParts.join(' ') || '𝐘𝐚𝐦𝐚𝐭𝐨 ┇🍁┇'}`
        }, { quoted: msg });
      }

      return await sock.sendMessage(chatId, { text: '⚠️ لم أجد صورة رعب حالياً.', quoted: msg });
    }

    if (mode === 'video') {
      let freshVids = results.filter(v => v?.nowm && !sentMedia.videos.includes(v.nowm));
      if (freshVids.length > 0) {
        const vid = freshVids[Math.floor(Math.random() * freshVids.length)];
        sentMedia.videos.push(vid.nowm);
        saveSentMedia();
        return await sock.sendMessage(chatId, {
          video: { url: vid.nowm },
          caption: `👻 *فيديو رعب قاتل!* 🩸\n😱 ${queryParts.join(' ') || '𝐘𝐚𝐦𝐚𝐭𝐨 ┇🍁┇'}`
        }, { quoted: msg });
      }

      // fallback YouTube
      try {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'horror-'));
        const outPath = path.join(tmpDir, 'video.%(ext)s');
        execSync(`yt-dlp "ytsearch5:${queryParts.join(' ') || 'scary horror'}" -f mp4 -o "${outPath}" --quiet --no-warnings`);

        const files = fs.readdirSync(tmpDir).filter(file => file.endsWith('.mp4'));
        if (files.length > 0) {
          const file = files[Math.floor(Math.random() * files.length)];
          const videoPath = path.join(tmpDir, file);
          sentMedia.videos.push(file);
          saveSentMedia();
          await sock.sendMessage(chatId, {
            video: fs.readFileSync(videoPath),
            caption: `👻 *فيديو رعب قاتل!* 🩸\n😱 ${queryParts.join(' ') || '𝐘𝐚𝐦𝐚𝐭𝐨 ┇🍁┇'}`
          }, { quoted: msg });
        }
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        return await sock.sendMessage(chatId, { text: '⚠️ لم أجد فيديو رعب حالياً.', quoted: msg });
      }
    }
  }
};