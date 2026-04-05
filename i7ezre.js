const fs = require('fs');
const path = require('path');

// ربط مع البنك
const bankFile = path.join(__dirname, '../bank.json');
function loadBank() {
  if (!fs.existsSync(bankFile)) return {};
  return JSON.parse(fs.readFileSync(bankFile));
}
function saveBank(data) {
  fs.writeFileSync(bankFile, JSON.stringify(data, null, 2));
}

module.exports = {
  command: 'احزر',
  description: 'بدء فعالية احزر وإرسال صورة مع تلميح (للمجموعات فقط).',
  usage: '.احزر',
  category: 'game',

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      if (!chatId || !chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId || msg.key.remoteJid, { text: '❌ هذا الأمر يعمل داخل المجموعات فقط.' }, { quoted: msg });
      }

      // حماية من تشغيل لعبة ثانية بنفس الجروب
      if (!global.activeGames) global.activeGames = {};
      const activeGames = global.activeGames;

      if (activeGames[chatId]) {
        return await sock.sendMessage(chatId, { text: '⚠️ توجد لعبة جارية حالياً، انتظر حتى تنتهي.' }, { quoted: msg });
      }

      // قائمة الصور والإجابات — تأكد أن الملفات موجودة داخل مجلد media2
      const images = [
        { file: 'image1.jpg', answer: 'يوريتشي' },
        { file: 'image2.jpg', answer: 'لوفي' },
        { file: 'image3.jpg', answer: 'توجي' },
        { file: 'image4.jpg', answer: 'استا' },
        { file: 'image5.jpg', answer: 'كايدو' },
        { file: 'image6.jpg', answer: 'ايتاتشي' },
        { file: 'image7.jpg', answer: 'سانجي' },
        { file: 'image8.jpg', answer: 'يوهان' },
        { file: 'image9.jpg', answer: 'ميكاسا' },
        { file: 'image10.jpg', answer: 'يامي' },
        { file: 'image11.jpg', answer: 'سوكونا' },
        { file: 'image12.jpg', answer: 'رايلي' },
        { file: 'image13.jpg', answer: 'ساي' },
        { file: 'image14.jpg', answer: 'ايانوكوجي' },
        { file: 'image15.jpg', answer: 'هيناتا' },
        { file: 'image16.jpg', answer: 'غوجو' },
        { file: 'image17.jpg', answer: 'ناغي' },
        { file: 'image18.jpg', answer: 'ايتيشغو' },
        { file: 'image19.jpg', answer: 'مادارا' },
        { file: 'image20.jpg', answer: 'ساسكي' },
        { file: 'image21.jpg', answer: 'يور' },
        { file: 'image22.jpg', answer: 'ناروتو' },
        { file: 'image23.jpg', answer: 'ايران' },
        { file: 'image24.jpg', answer: 'ثورفين' },
        { file: 'image25.jpg', answer: 'ايزن' },
        { file: 'image26.jpg', answer: 'ميدوريا' },
        { file: 'image27.jpg', answer: 'سوبارو' }, 
        { file: 'image28.jpg', answer: 'رينجوكو' }, 
        { file: 'image29.jpg', answer: 'زنيتسو' }, 
        { file: 'image30.jpg', answer: 'غوجو' },
        { file: 'image31.jpg', answer: 'شانكس' }, 
        { file: 'image32.jpg', answer: 'ايانوكوجي' }, 
      ];

      const selected = images[Math.floor(Math.random() * images.length)];
      if (!selected || !selected.file || !selected.answer) {
        return await sock.sendMessage(chatId, { text: '❌ خطأ: لم يتم اختيار صورة صالحة. يرجى تحديث قائمة الصور.' }, { quoted: msg });
      }

      const imagePath = path.join(__dirname, '..', 'media2', selected.file);
      if (!fs.existsSync(imagePath)) {
        return await sock.sendMessage(chatId, { text: '❌ لم يتم العثور على الصورة! تأكد من وجودها داخل مجلد media2.' }, { quoted: msg });
      }

      const caption = `*تــفـــضــل احزر يــروحـــي ⇅🔵*\n` +
                      `╮───────────────────⟢ـ\n` +
                      `┆˼🪷˹┆الــوقــت ⟣ ⌊60 ثانية⌉\n` +
                      `┆˼🔵˹┆الــجـائـزه ⟣ ⌊4999 نقطة⌉\n` +
                      `┆˼🪻˹┆الــمــطــور ⟣ ⌊Adrian North⌉\n` +
                      `╯───────────────────⟢ـ\n` +
                      `> اكتب اسم الشخصية أو اكتب *تلميح* للجواب 🍷`;

      // إرسال الصورة مع التسمية
      const imageBuffer = fs.readFileSync(imagePath);
      await sock.sendMessage(chatId, { image: imageBuffer, caption }, { quoted: msg });

      // ضبط حالة اللعبة
      activeGames[chatId] = true;
      let answered = false;

      // تشابه بسيط (حساب تطابق حروف متسلسل)
      function similarity(s1, s2) {
        s1 = String(s1 || '').toLowerCase().replace(/\s+/g, '');
        s2 = String(s2 || '').toLowerCase().replace(/\s+/g, '');
        const maxLen = Math.max(s1.length, s2.length);
        if (maxLen === 0) return 100;
        let matches = 0;
        for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
          if (s1[i] === s2[i]) matches++;
        }
        return (matches / maxLen) * 100;
      }

      function getHint(answer) {
        const arr = answer.split('');
        for (let i = 1; i < arr.length; i += 2) arr[i] = '؟';
        return arr.join('-');
      }

      // المستمع للرسائل — دالة مسماة حتى نقدر نحذفها لاحقًا
      const onMessage = async (update) => {
        try {
          const msgs = update.messages;
          if (!msgs || !msgs.length) return;
          const m = msgs[0];
          if (!m.message) return;
          if (m.key.remoteJid !== chatId) return; // فقط نفس الجروب

          let text = m.message.conversation || m.message.extendedTextMessage?.text || '';
          text = String(text).trim();
          if (!text) return;

          // تلميح
          if (text.toLowerCase() === 'تلميح') {
            return await sock.sendMessage(chatId, { text: `💡 تلميح: ${getHint(selected.answer)}` }, { quoted: m });
          }

          // التحقق من الإجابة
          const score = similarity(text, selected.answer);
          if (score >= 90) {
            answered = true;
            clearTimeout(timeout);
            await sock.sendMessage(chatId, { text: `✅ إجابة صحيحة! 🔵🎉\n🏆 الجائزة: 4999 نقطة\nالإجابة: *${selected.answer}*` }, { quoted: m });
            cleanup();
            return;
          } else if (score >= 70) {
            await sock.sendMessage(chatId, { text: `⚠️ لقد أوشكت على النجاح! ✨` }, { quoted: m });
            return;
          } else if (score >= 30) {
            await sock.sendMessage(chatId, { text: `❌ إجابة خاطئة! حاول مرة أخرى.` }, { quoted: m });
            return;
          }
        } catch (e) {
          console.error('❌ خطأ داخل مستمع احزر:', e);
        }
      };

      // تنظيف الحالة وازالة الـ listener
      function cleanup() {
        activeGames[chatId] = false;
        try { sock.ev.off('messages.upsert', onMessage); } catch (e) { /* ignore */ }
      }

      // مؤقت 60 ثانية
      const timeout = setTimeout(async () => {
        if (!answered) {
          await sock.sendMessage(chatId, { text: `⌯ انتهى الوقت ⌯\nالإجابة الصحيحة: *${selected.answer}*` });
        }
        cleanup();
      }, 60_000);

      // منع تعدد المستمعين ثم إضافة واحد جديد
      try { sock.ev.off('messages.upsert', onMessage); } catch (e) { /* ignore */ }
      sock.ev.on('messages.upsert', onMessage);

    } catch (err) {
      console.error('❌ خطأ في تنفيذ أمر احزر:', err);
      // إذا حدث خطأ غير متوقع تأكد من إعادة تهيئة الحالة
      try { if (global.activeGames && global.activeGames[msg.key.remoteJid]) global.activeGames[msg.key.remoteJid] = false; } catch (e) {}
    }
  }
};