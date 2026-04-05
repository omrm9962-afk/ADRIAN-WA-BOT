const axios = require("axios");

module.exports = {
  command: "copy",
  category: "group",
  description: "📋 ينسخ اسم ووصف وصورة الجروب الحالي أو من لينك جروب آخر.",
  usage: ".copy [رابط_جروب]",

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;
      const link = args[0];

      // 🧩 لو مفيش لينك
      if (!link) {
        if (!chatId.endsWith("@g.us")) {
          return await sock.sendMessage(chatId, {
            text: "❌ هذا الأمر يعمل فقط داخل المجموعات أو مع رابط جروب."
          }, { quoted: msg });
        }

        const metadata = await sock.groupMetadata(chatId).catch(() => null);
        if (!metadata) {
          return await sock.sendMessage(chatId, {
            text: "❌ لم أتمكن من جلب بيانات الجروب."
          }, { quoted: msg });
        }

        const groupName = metadata.subject || "without name";
        const description = metadata.desc || "without des";

        // 🔥 جلب صورة الجروب
        let pfp = null;
        try {
          pfp = await sock.profilePictureUrl(chatId, "image");
        } catch {
          pfp = null;
        }

        const text = `📋 *Copy group data*\n\n🏷️ *name:* ${groupName}\n\n📝 *des:*\n${description}`;

        if (pfp) {
          await sock.sendMessage(chatId, {
            image: { url: pfp },
            caption: text
          }, { quoted: msg });
        } else {
          await sock.sendMessage(chatId, { text }, { quoted: msg });
        }

        return;
      }

      // 🧩 لو فيه لينك
      const match = link.match(/(?:https?:\/\/chat\.whatsapp\.com\/)?([0-9A-Za-z]{20,})/);
      if (!match) {
        return await sock.sendMessage(chatId, {
          text: "❌ الرابط غير صالح."
        }, { quoted: msg });
      }

      const inviteCode = match[1];
      const info = await sock.groupGetInviteInfo(inviteCode).catch(() => null);

      if (!info) {
        return await sock.sendMessage(chatId, {
          text: "❌ لم أستطع الحصول على بيانات الجروب من الرابط."
        }, { quoted: msg });
      }

      const groupName = info.subject || "بدون اسم";
      const description = info.desc || "لا يوجد وصف حالياً";

      // 🔥 جلب صورة الجروب من اللينك (محسن)
      let pfp = null;

      try {
        if (info.imgUrl) {
          pfp = info.imgUrl;
        } else if (info.id) {
          pfp = await sock.profilePictureUrl(info.id, "image");
        }
      } catch {
        pfp = null;
      }

      const text = `📋 *Copy group data*\n\n🏷️ *name:* ${groupName}\n\n📝 *des:*\n${description}`;

      if (pfp) {
        await sock.sendMessage(chatId, {
          image: { url: pfp },
          caption: text
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, {
          text: text + "\n\n⚠️ لا توجد صورة للجروب."
        }, { quoted: msg });
      }

    } catch (err) {
      console.error("❌ خطأ في أمر كوبي:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ حدث خطأ أثناء تنفيذ الأمر.",
      }, { quoted: msg });
    }
  },
};