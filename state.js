//لـڪـل واحـد بيـعـدل
//امــــڪ لسـة بتـجـيـلي ع فـكـره حلفـه م تبطل تيجي غير لما تبطل انت تغير وتعدل 🗿🗿

const fs = require('fs');
const path = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'حالة',
    category: 'tools',
    description: 'يعرض حالة وسرعة البوت مع مدة التشغيل',
    usage: '.حالة',

    async execute(sock, msg) {
        try {
            const chatId = msg.key.remoteJid;

            // حساب سرعة الاستجابة (Ping)
            const start = Date.now();
            const uptimeSeconds = process.uptime();
            const uptimeFormatted = new Date(uptimeSeconds * 1000)
                .toISOString()
                .substr(11, 8);
            const end = Date.now();
            const ping = end - start;

            // تحديد مسار الصورة
            const imagePath = path.join(process.cwd(), 'مارو', 'ping.jpg');

            if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: `🟢 *𝐖𝐀𝐈𝐓 𝐂𝐇𝐄𝐂𝐊...*\n\n🤖 *𝒃𝒐𝒕 𝒔𝒕𝒂𝒕𝒖𝒔 :*\n⚡ *𝒔𝒑𝒆𝒆𝒅 :* ${ping}ms\n⏱️ *𝒕𝒊𝒎𝒆 :* ${uptimeFormatted}\n\n*𝔹𝕆𝕋 𝔸𝔻ℝ𝕀𝔸ℕ 𝔼𝕃 𝕂𝕀ℕ𝔾 👑*`
                }, { quoted: msg });
            } else {
                // في حال عدم وجود الصورة
                await sock.sendMessage(chatId, {
                    text:`🟢 *𝐖𝐀𝐈𝐓 𝐂𝐇𝐄𝐂𝐊...*\n\n🤖 *𝒃𝒐𝒕 𝒔𝒕𝒂𝒕𝒖𝒔 :*\n⚡ *𝒔𝒑𝒆𝒆𝒅 :* ${ping}ms\n⏱️ *𝒕𝒊𝒎𝒆 :* ${uptimeFormatted}\n\n*𝔹𝕆𝕋 𝔸𝔻ℝ𝕀𝔸ℕ 𝔼𝕃 𝕂𝕀ℕ𝔾 👑*`
                }, { quoted: msg });
            }

        } catch (error) {
            console.error('❌ خطأ في كود حالة البوت:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ حدث خطأ أثناء جلب حالة البوت، حاول لاحقًا.'
            }, { quoted: msg });
        }
    }
};