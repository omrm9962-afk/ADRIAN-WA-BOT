const axios = require("axios");
const path = require("path");

module.exports = {
  command: ["ai"],
  description: "ذكاء اصطناعي يجيب على أي سؤال",
  category: "ai",

  async execute(sock, msg, args = []) {
    const apiKey = "AIzaSyDl_cOw4nIvWe9CezHsKNkG-3olVtZOX3Y"; // 🔑 مفتاح Gemini
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderMention = `@${(sender || '').split("@")[0]}`;
    const chatId = msg.key.remoteJid;

    // ✅ إرسال تفاعل
    await sock.sendMessage(chatId, {
      react: { text: "🤖", key: msg.key },
    });

    // ✅ الصورة المخصصة
    const imagePath = path.join(__dirname, "..", "مارو", "صورة.jpg");

    // ✅ نص الرسالة بالكامل
    const fullText =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      "";

    // ✅ استخراج السؤال بعد الأمر
    const question = fullText.replace(/^(\.|,|،)?ai\s*/i, "").trim();

    // ✅ لو مفيش سؤال، اعرض مثال
    if (!question) {
      const examples = [
        "من هو أول خليفة للمسلمين؟",
        "ما هي عاصمة فرنسا؟",
        "من مكتشف الجاذبية؟",
        "ما أطول نهر في العالم؟",
        "كم عدد الكواكب في المجموعة الشمسية؟",
      ];
      const example = examples[Math.floor(Math.random() * examples.length)];

      const caption = `*⊱ ────── {.⋅ 🍷 ⋅.} ───── ⊰*\n✨ يمكنك سؤالي عن أي شيء في العالم!\n> مثال: ${example}\n*⊱ ────── {.⋅ 🥀 ⋅.} ───── ⊰*\n> *𝗔𝗗𝗥𝗜𝗔𝗡 𝐀𝐈 🤖*`;

      return sock.sendMessage(chatId, {
        image: { url: imagePath },
        caption,
      }, { quoted: msg });
    }

    // ✅ رسالة انتظار
    await sock.sendMessage(chatId, { text: "⌛ جاري التفكير... انتظر قليلاً 🧠" }, { quoted: msg });

    try {
      // ✅ إرسال الطلب لـ Gemini API
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        { contents: [{ parts: [{ text: question }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      let reply = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

      // ✅ معالجة النص
      if (reply) {
        reply = reply
          .replace(/\*\*(.*?)\*\*/g, "*$1*")
          .replace(/\n/g, "\n➤ ")
          .replace(/- /g, "• ");

        const caption = `*⊱ ────── {.⋅ 🌙 ⋅.} ───── ⊰*\n${reply}\n*⊱ ────── {.⋅ 🌿 ⋅.} ───── ⊰*\n> *𝐘𝐚𝐦𝐚𝐭𝐨 𝐀𝐈 ✨*`;

        return sock.sendMessage(chatId, {
          image: { url: imagePath },
          caption,
          mentions: [sender],
        }, { quoted: msg });
      } else {
        throw new Error("رد غير متوفر من الذكاء الصناعي");
      }

    } catch (err) {
      console.error("❌ خطأ في الاتصال بـ Gemini API:", err.message);

      const caption = `*⊱ ────── {.⋅ ⚠️ ⋅.} ───── ⊰*\nحدث خطأ أثناء الاتصال بـ AI.\n> حاول لاحقاً ${senderMention}\n*⊱ ────── {.⋅ 🍃 ⋅.} ───── ⊰*\n> *𝐘𝐚𝐦𝐚𝐭𝐨*`;

      return sock.sendMessage(chatId, {
        image: { url: imagePath },
        caption,
      }, { quoted: msg });
    }
  },
};