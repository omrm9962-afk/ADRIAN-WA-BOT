const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'استيكر',
  async execute(sock, m) {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) {
        return sock.sendMessage(m.key.remoteJid, { text: '⚠️ رد على صورة أو فيديو علشان تحويله لاستيكر.' }, { quoted: m });
      }

      const isImage = !!quoted.imageMessage;
      const isVideo = !!quoted.videoMessage;
      if (!isImage && !isVideo) {
        return sock.sendMessage(m.key.remoteJid, { text: '⚠️ لازم ترد على صورة أو فيديو.' }, { quoted: m });
      }

      const type = isImage ? 'image' : 'video';
      const stream = await downloadContentFromMessage(quoted[type + 'Message'], type);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      if (!buffer.length) return sock.sendMessage(m.key.remoteJid, { text: '❌ فشل تحميل الملف.' }, { quoted: m });

      // استخدم مجلد خارجي مؤقت حتى واتساب يقدر يقرأ الملف قبل الحذف
      const tmpDir = '/sdcard/.temp_sticker';
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const inputPath = path.join(tmpDir, `input.${isVideo ? 'mp4' : 'jpg'}`);
      const outputPath = path.join(tmpDir, `output.webp`);
      fs.writeFileSync(inputPath, buffer);

      // مسار ffmpeg في termux
      const ffmpeg = '/data/data/com.termux/files/usr/bin/ffmpeg';

      // Commands:
      // - للصورة: crop وسطى ثم scale 512x512 (يملأ الإطار)
      // - للفيديو: scale (increase) ثم crop 512x512 ثم تحويل لanimated webp
      let ffmpegCmd = '';
      if (isImage) {
        ffmpegCmd = `${ffmpeg} -y -i "${inputPath}" -vf "crop='min(iw,ih)':'min(iw,ih)',scale=512:512" -vcodec libwebp -lossless 1 -preset picture -an -q:v 80 -vsync 0 "${outputPath}"`;
      } else {
        // للفيديو: نجرب إعداد جيد لحجم معقول (fps منخفض، جودة متوازنة)
        ffmpegCmd = `${ffmpeg} -y -i "${inputPath}" -vf "crop='min(iw,ih)':'min(iw,ih)',scale=512:512:force_original_aspect_ratio=disable,fps=15" -loop 0 -t 10 -vcodec libwebp -preset default -lossless 0 -qscale 50 -an -vsync 0 "${outputPath}"`;
      }

      exec(ffmpegCmd, async (err) => {
        if (err) {
          console.error('FFmpeg error:', err);
          // محاولة بديلة: للفيديو نحاول استخراج فريم أول وإرساله كاستيكر ثابت
          if (isVideo) {
            try {
              const fallbackImg = path.join(tmpDir, 'fallback.jpg');
              const fallbackWebp = path.join(tmpDir, 'fallback.webp');
              // استخراج فريم أول
              await execPromise(`${ffmpeg} -y -i "${inputPath}" -vf "select=eq(n\\,0)" -frames:v 1 "${fallbackImg}"`);
              // تحويل لصورة webp ثابتة
              await execPromise(`${ffmpeg} -y -i "${fallbackImg}" -vf "crop='min(iw,ih)':'min(iw,ih)',scale=512:512" -vcodec libwebp -lossless 1 -preset picture -an -q:v 80 "${fallbackWebp}"`);
              const wb = fs.readFileSync(fallbackWebp);
              await sock.sendMessage(m.key.remoteJid, { sticker: wb }, { quoted: m });
              // clean
              cleanupFiles([inputPath, fallbackImg, fallbackWebp]);
              return;
            } catch (fbErr) {
              console.error('Fallback error:', fbErr);
            }
          }
          await sock.sendMessage(m.key.remoteJid, { text: '❌ فشل تحويل الوسائط. تأكد أن ffmpeg متاح.' }, { quoted: m });
          cleanupFiles([inputPath]);
          return;
        }

        // تأكد الملف موجود وحجمه معقول
        if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
          await sock.sendMessage(m.key.remoteJid, { text: '❌ ملف الاستيكر لم يُنشأ أو حجمه صفر.' }, { quoted: m });
          cleanupFiles([inputPath, outputPath]);
          return;
        }

        // لو الحجم كبير جدًا (مثلاً أكثر من 1.5MB) نقص الجودة وأعد التحويل (لتجنب رفض واتساب)
        const maxAccept = 1.5 * 1024 * 1024; // 1.5 MB
        if (fs.statSync(outputPath).size > maxAccept && !isImage) {
          // إعادة تحويل بجودة أقل
          const smaller = path.join(tmpDir, 'output_small.webp');
          const reduceCmd = `${ffmpeg} -y -i "${inputPath}" -vf "crop='min(iw,ih)':'min(iw,ih)',scale=512:512:force_original_aspect_ratio=disable,fps=12" -loop 0 -t 8 -vcodec libwebp -preset default -lossless 0 -qscale 60 -an -vsync 0 "${smaller}"`;
          try {
            await execPromise(reduceCmd);
            if (fs.existsSync(smaller)) {
              const buf = fs.readFileSync(smaller);
              await sock.sendMessage(m.key.remoteJid, { sticker: buf }, { quoted: m });
              cleanupFiles([inputPath, outputPath, smaller]);
              return;
            }
          } catch (e) {
            console.error('Reduce error:', e);
          }
        }

        // إرسال الاستيكر
        try {
          const webpBuf = fs.readFileSync(outputPath);
          await sock.sendMessage(m.key.remoteJid, { sticker: webpBuf }, { quoted: m });
        } catch (sendErr) {
          console.error('Send error:', sendErr);
          await sock.sendMessage(m.key.remoteJid, { text: '❌ فشل إرسال الاستيكر.' }, { quoted: m });
        }

        // تنظيف الملفات
        cleanupFiles([inputPath, outputPath]);
      });

      // مساعدات: تحويل exec إلى Promise
      function execPromise(cmd) {
        return new Promise((res, rej) => {
          exec(cmd, (e, so, se) => e ? rej(e) : res({ so, se }));
        });
      }

      function cleanupFiles(list) {
        for (const f of list) {
          try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
        }
      }

    } catch (e) {
      console.error('General error:', e);
      await sock.sendMessage(m.key.remoteJid, { text: '❌ حدث خطأ أثناء المعالجة.' }, { quoted: m });
    }
  }
};