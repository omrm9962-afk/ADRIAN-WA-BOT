//
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'جيميني',
  description: 'اسألني أي سؤال',
  category: 'ai',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const input = text.trim().split(' ').slice(1).join(' ');

    if (!input) {
      return sock.sendMessage(chatId, { text: '⚠️ من فضلك اكتب سؤالك' }, { quoted: msg });
    }

    try {
      // تأكد من وضع رابط صحيح للـ API هنا
      const response = await axios.post('https://api.gemini.com/v1/aicall', {
        apikey: 'AIzaSyA8lUWPtcbNWOXx4YBd-6Il5-8qh1GIHgY',
        query: input
      });

      const answer = response.data.answer || 'لم أتمكن من الحصول على إجابة.';

      // إرسال الصورة إذا موجودة
      const imagePath = path.join(process.cwd(), '../مارو/صورة.jpg');
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const imageMessage = await sock.sendMessage(chatId, { 
          image: imageBuffer
        }, { quoted: msg });

        await sock.sendMessage(chatId, { text: answer }, { quoted: imageMessage });
      } else {
        await sock.sendMessage(chatId, { text: answer }, { quoted: msg });
      }
    } catch (apiError) {
      console.error('خطأ في الطلب إلى API Gemini:', apiError);
      await sock.sendMessage(chatId, { text: '❌ حدث خطأ في الطلب إلى API Gemini' }, { quoted: msg });
    }
  }
};