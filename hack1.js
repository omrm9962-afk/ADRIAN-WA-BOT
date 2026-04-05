const { jidDecode } = require('@whiskeysockets/baileys');
const { isElite } = require('../haykala/elite.js');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'هاك',
    description: 'محاكاة تهكير الجهاز لأي عضو من النخبة',
    usage: '.تهكير',

    async execute(sock, msg) {
        try {
            const chatId = msg.key.remoteJid;
            const sender = decode(msg.key.participant || chatId);
            const senderLid = sender.split('@')[0];

            if (!isElite(senderLid)) {
                return await sock.sendMessage(chatId, {
                    text: '❌ لا تملك صلاحية استخدام هذا الأمر.'
                }, { quoted: msg });
            }

            const phone = senderLid;
            const devices = {
                '212': 'Samsung Galaxy A32 🇲🇦',
                '966': 'iPhone 11 Pro 🇸🇦',
                '20': 'Oppo Reno 8 🇪🇬',
                '963': 'Xiaomi Redmi Note 10 🇸🇾',
                '964': 'Realme 9 Pro+ 🇮🇶',
                '971': 'Samsung Galaxy S22 🇦🇪',
                '1': 'iPhone 14 Pro Max 🇺🇸/🇨🇦',
                '90': 'Huawei Nova 9 🇹🇷'
            };
            const device = devices[phone.slice(0, 3)] || 'جهاز غير معروف';

            // شريط تقدم متتابع
            const progressSteps = [
                '▮▯▯▯▯▯▯▯▯▯ 10%',
                '▮▮▯▯▯▯▯▯▯▯ 20%',
                '▮▮▮▯▯▯▯▯▯▯ 30%',
                '▮▮▮▮▯▯▯▯▯▯ 40%',
                '▮▮▮▮▮▯▯▯▯▯ 50%',
                '▮▮▮▮▮▮▯▯▯▯ 60%',
                '▮▮▮▮▮▮▮▯▯▯ 70%',
                '▮▮▮▮▮▮▮▮▯▯ 80%',
                '▮▮▮▮▮▮▮▮▮▯ 90%',
                '▮▮▮▮▮▮▮▮▮▮ 100%'
            ];

            let sentMsg;
            for (const step of progressSteps) {
                const text = `🛠️ جاري الاختراق، عد مـعـايـا كد ي برو...\n${step}`;
                if (!sentMsg) {
                    sentMsg = await sock.sendMessage(chatId, { text }, { quoted: msg });
                } else {
                    await sock.sendMessage(chatId, { text, edit: sentMsg.key }, { quoted: msg });
                }
                await new Promise(res => setTimeout(res, 500));
            }

            const finalText = `✅ تم تـهـكـير الضـحية بنجاح!\n\n• 📱 الجهاز المتوقع: ${device}\n• 🌍 رمز الدولة: ${phone.slice(0, 3)}\n*سـيـتـم إࢪسـال بـاقـي المـعـلـومـات الــي كيـلــوا 🚬🫦*\n *مـعـلـومـاتـڪ عـنـد 𝐊𝐄𝐋𝐖𝐀 بـايـده يـفـشـخڪڪ🚬🍻*`;
            await sock.sendMessage(chatId, { text: finalText }, { quoted: msg });

        } catch (err) {
            console.error('❌ فشل تنفيذ أمر تهكير:', err);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ فشل تنفيذ الأمر.' }, { quoted: msg });
        }
    }
};