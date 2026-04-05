const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  command: 'صور',
  description: '🔎 البحث عن صور عبر Bing',
  usage: '.صور [كلمة البحث] [عدد الصور]',
  category: 'media',

  async execute(sock, message) {
    const chatId = message.key.remoteJid;
    const args = message.args || [];

    // ✅ التحقق من المعطيات
    if (args.length === 0) {
      return await sock.sendMessage(chatId, {
        text: '❌ الرجاء كتابة اسم الصور وعددها مثل:\n`.صور لوفي 5`',
      }, { quoted: message });
    }

    // ⛏️ استخراج عدد الصور
    let count = 5;
    if (!isNaN(args[args.length - 1])) {
      count = Math.min(parseInt(args.pop()), 20); // الحد الأقصى 20 صور
    }

    const query = args.join(' ');
    if (!query) {
      return await sock.sendMessage(chatId, {
        text: '❌ الرجاء كتابة اسم الصور وعددها مثل:\n`.صور لوفي 5`',
      }, { quoted: message });
    }

    try {
      // 🌐 جلب نتائج البحث من Bing
      const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC2`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        timeout: 10000 // ⏱️ تفادي تعليق طويل في حال فشل التحميل
      });

      // 🧠 استخراج الصور من الصفحة
      const $ = cheerio.load(data);
      const imageUrls = [];

      $('a.iusc').each((i, el) => {
        if (imageUrls.length >= count) return false;
        const m = $(el).attr('m');
        if (m) {
          try {
            const meta = JSON.parse(m);
            if (meta.murl) imageUrls.push(meta.murl);
          } catch { }
        }
      });

      // ⚠️ تحقق من النتائج
      if (imageUrls.length === 0) {
        return await sock.sendMessage(chatId, {
          text: '❌ لم يتم العثور على صور. جرب كلمة مختلفة.',
        }, { quoted: message });
      }

      // 📤 إرسال الصور
      for (const [index, imageUrl] of imageUrls.entries()) {
        await sock.sendMessage(chatId, {
          image: { url: imageUrl },
          caption: `📸 (${index + 1}/${imageUrls.length}) ${query}`
        }, { quoted: message });
        await new Promise(res => setTimeout(res, 500)); // 💤 تأخير بسيط لتفادي الحظر
      }

    } catch (err) {
      console.error('❌ خطأ في جلب الصور:', err.message);
      return await sock.sendMessage(chatId, {
        text: '❌ حدث خطأ أثناء جلب الصور. تأكد من اتصالك أو حاول لاحقًا.',
      }, { quoted: message });
    }
  }
};