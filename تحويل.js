const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'متحرك',
  desc: '🎞️ تحويل فيديو أقل من 10 ثواني إلى ملصق متحرك',
  category: 'أدوات',

  async execute(sock, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || !quoted.videoMessage) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❌ يجب الرد على فيديو (أقل من 10 ثواني) لتحويله إلى ملصق.',
      }, { quoted: msg });
    }

    const duration = quoted.videoMessage.seconds || 0;
    if (duration > 10) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❌ الفيديو طويل! يرجى اختيار فيديو أقل من 10 ثواني.',
      }, { quoted: msg });
    }

    const mediaPath = path.join(__dirname, 'temp.mp4');
    const stickerPath = path.join(__dirname, 'sticker.webp');

    const buffer = await downloadMediaMessage(
      { message: quoted },
      'buffer',
      {},
      { logger: console, reuploadRequest: sock.updateMediaMessage }
    );

    fs.writeFileSync(mediaPath, buffer);

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', mediaPath,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
        '-t', '10',
        '-r', '15',
        '-f', 'webp',
        '-loop', '0',
        stickerPath,
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('FFmpeg failed'));
      });
    });

    await sock.sendMessage(msg.key.remoteJid, {
      sticker: fs.readFileSync(stickerPath),
    }, { quoted: msg });

    fs.unlinkSync(mediaPath);
    fs.unlinkSync(stickerPath);
  }
};