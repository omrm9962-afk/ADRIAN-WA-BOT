// plugins/انذار.js
const fs = require('fs');
const path = require('path');

let warningsFile = path.join(__dirname, '../warnings.json');
let zarfFile = path.join(process.cwd(), 'zarf.json');

// لو ملف التحذيرات مش موجود، نعمل واحد جديد
if (!fs.existsSync(warningsFile)) {
  fs.writeFileSync(warningsFile, JSON.stringify({}));
}

module.exports = {
  name: 'انذار',
  command: ['انذار'],
  category: 'group',
  description: 'اعطاء إنذار لعضو عن طريق الرد او المنشن',

  async execute(sock, msg) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      let target;
      if (quoted) {
        target = quoted;
      } else if (mentioned.length > 0) {
        target = mentioned[0];
      } else {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ لازم ترد على رسالة أو تمنشن شخص عشان تعطيه إنذار.'
        }, { quoted: msg });
      }

      // قراءة التحذيرات
      let warnings = JSON.parse(fs.readFileSync(warningsFile));
      if (!warnings[target]) warnings[target] = 0;
      warnings[target] += 1;
      fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

      // نص رسالة الإنذار
      let text = `⚠️ *تــم إعــــطـاء إنـذاࢪ جـديـد لـ* @${target.split('@')[0]} \n\n*عدد الإنذارات:* *${warnings[target]}*`;

      // لو وصل 4 إنذارات يطرده
      if (warnings[target] >= 4) {
        text += `\n\n❌ *الـزنـجـيـ/ة* @${target.split('@')[0]}*وصـلـ/ت للـحـد الأقـصـي (4) وسيـتـم زࢪفـــــه قـول بـاي بـاي انـتـهـت مسـيـرتك هـنـا* 👋🏻.`;
        await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'remove');
        warnings[target] = 0;
        fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
      }

      // جلب بيانات الزرف
      let zarfData = {};
      if (fs.existsSync(zarfFile)) {
        zarfData = JSON.parse(fs.readFileSync(zarfFile));
      }

      if (zarfData.media?.status === 'on' && zarfData.media.image) {
        const imgPath = path.join(process.cwd(), zarfData.media.image);
        if (fs.existsSync(imgPath)) {
          const imageBuffer = fs.readFileSync(imgPath);
          return await sock.sendMessage(msg.key.remoteJid, {
            image: imageBuffer,
            caption: text,
            mentions: [target]
          }, { quoted: msg });
        }
      }

      // fallback لو مفيش صورة
      await sock.sendMessage(msg.key.remoteJid, {
        text,
        mentions: [target]
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حصل خطأ أثناء إعطاء الإنذار.'
      }, { quoted: msg });
    }
  }
};