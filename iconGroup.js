const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { isElite } = require('../haykala/elite.js');

module.exports = {
  command: 'icon',
  description: 'تغيير صورة الجروب (للنخبة فقط)',
  usage: '.icon (أرسل صورة أو رد على صورة)',

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      const senderId = msg.key.participant || msg.key.remoteJid;

      // تحقق من صلاحية النخبة
      if (!isElite(senderId)) {
        return sock.sendMessage(chatId, {
          text: '❌ هذا الأمر متاح فقط لأعضاء النخبة!'
        }, { quoted: msg });
      }

      // التحقق من وجود صورة مرفقة أو صورة في الرسالة المردود عليها
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imageMessage = quoted?.imageMessage || msg.message?.imageMessage;

      if (!imageMessage) {
        return sock.sendMessage(chatId, {
          text: '❌ يرجى إرسال صورة أو الرد على صورة لتغيير صورة المجموعة.'
        }, { quoted: msg });
      }

      // تنزيل الصورة
      const buffer = await downloadMediaMessage({ message: { imageMessage } }, 'buffer', {});
      if (!buffer || buffer.length === 0) {
        return sock.sendMessage(chatId, { text: '⚠️ فشل تحميل الصورة.' }, { quoted: msg });
      }

      // إنشاء مجلد مؤقت
      const tempDir = '/sdcard/Yamato/bot1/temp';
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const inputPath = path.join(tempDir, 'group_profile.webp');
      const outputPath = path.join(tempDir, 'group_profile.jpg');
      fs.writeFileSync(inputPath, buffer);

      // تحويل الصورة من WebP إلى JPG
      exec(`ffmpeg -i ${inputPath} -y ${outputPath}`, async (err) => {
        if (err) {
          console.error('❌ خطأ في تحويل الصورة:', err);
          return sock.sendMessage(chatId, {
            text: '❌ فشل تحويل الصورة. تأكد أن ffmpeg مثبت.'
          }, { quoted: msg });
        }

        try {
          const imageBuffer = fs.readFileSync(outputPath);

          // تغيير صورة المجموعة
          await sock.updateProfilePicture(chatId, imageBuffer);

          await sock.sendMessage(chatId, {
            text: '✅ تم تغيير صورة المجموعة بنجاح!'
          }, { quoted: msg });

          // تنظيف الملفات المؤقتة
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        } catch (e) {
          console.error('❌ فشل رفع الصورة:', e);
          await sock.sendMessage(chatId, {
            text: '❌ فشل رفع الصورة، تأكد أن البوت أدمن في الجروب.'
          }, { quoted: msg });
        }
      });

    } catch (error) {
      console.error('⚠️ خطأ:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء محاولة تغيير صورة المجموعة.'
      }, { quoted: msg });
    }
  }
};