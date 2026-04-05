const { isElite } = require('../haykala/elite.js'); // المسار الصحيح

module.exports = {
    command: 'ادخل',
    description: 'أمر للنخبة يجعل البوت يدخل جروب عبر رابط دعوة',
    usage: '.ادخل <رابط الدعوة>',

    async execute(sock, msg) {
        try {
            const chatId = msg.key.remoteJid;
            const sender = msg.key.participant || chatId;

            // تحقق من النخبة
            if (!await isElite(sender.split('@')[0])) {
                return await sock.sendMessage(chatId, { text: '🚫 هذا الأمر مخصص فقط للنخبة.' }, { quoted: msg });
            }

            // الحصول على الرابط من الرسالة
            let inviteLink = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
            inviteLink = inviteLink.trim();

            if (!inviteLink) {
                return await sock.sendMessage(chatId, { text: '❗️ أرسل رابط دعوة الجروب مع الأمر أو بالرد على رسالة تحتوي الرابط.' }, { quoted: msg });
            }

            const inviteCodeMatch = inviteLink.match(/chat.whatsapp.com\/([0-9A-Za-z]+)/);
            if (!inviteCodeMatch) {
                return await sock.sendMessage(chatId, { text: '❌ رابط دعوة غير صالح.' }, { quoted: msg });
            }
            const inviteCode = inviteCodeMatch[1];

            // محاولة الانضمام
            await sock.groupAcceptInvite(inviteCode).catch(() => {
                sock.sendMessage(chatId, { text: '❌ فشل الانضمام إلى الجروب. تأكد من صلاحية الرابط.' }, { quoted: msg });
            });

            // رسالة نجاح
            await sock.sendMessage(chatId, { text: '✅ تم الانضمام إلى الجروب بنجاح!' }, { quoted: msg });

        } catch (err) {
            console.error('❌ خطأ في تنفيذ أمر ادخل:', err);
        }
    }
};