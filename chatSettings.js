const { isElite } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'شات',
    description: 'إدارة إعدادات الجروب من فتح أو قفل مؤقت.',
    usage: '.شات [فتح|قفل][وقت بالدقايق]',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const sender = decode(msg.key.participant || groupJid);
            const senderLid = sender.split('@')[0];

            if (!groupJid.endsWith('@g.us')) {
                return await sock.sendMessage(groupJid, {
                    text: '❗ هذا الأمر يعمل فقط داخل المجموعات.'
                }, { quoted: msg });
            }

            if (!isElite(senderLid)) {
                return await sock.sendMessage(groupJid, {
                    text: '❌ ليس لديك صلاحية لاستخدام هذا الأمر.'
                }, { quoted: msg });
            }

            const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
            const lower = body.toLowerCase();

            let option = null;
            if (lower.includes('فتح')) option = 'فتح';
            else if (lower.includes('قفل')) option = 'قفل';

            if (!option) {
                return await sock.sendMessage(groupJid, {
                    text: '❌ يرجى تحديد الخيار: .شات فتح أو .شات قفل'
                }, { quoted: msg });
            }

            // استخراج الرقم (المدة)
            const timeMatch = lower.match(/(\d+)/);
            const minutes = timeMatch ? parseInt(timeMatch[1]) : null;

            // تنفيذ الأمر
            if (option === 'فتح') {
                await sock.groupSettingUpdate(groupJid, 'not_announcement');
                await sock.sendMessage(groupJid, { text: `✅ Open chat ${minutes ? `for ${minutes} for` : 'without time'}` }, { quoted: msg });

                if (minutes) {
                    setTimeout(async () => {
                        await sock.groupSettingUpdate(groupJid, 'announcement');
                        await sock.sendMessage(groupJid, { text: '⏰ The time is end, close chat successfully!.' });
                    }, minutes * 60 * 1000);
                }

            } else if (option === 'قفل') {
                await sock.groupSettingUpdate(groupJid, 'announcement');
                await sock.sendMessage(groupJid, { text: `🔒 Close chat ${minutes ? `for ${minutes} min` : 'without time'}` }, { quoted: msg });

                if (minutes) {
                    setTimeout(async () => {
                        await sock.groupSettingUpdate(groupJid, 'not_announcement');
                        await sock.sendMessage(groupJid, { text: '*🔓 The time is end, open chat successfully*.' });
                    }, minutes * 60 * 1000);
                }
            }

        } catch (error) {
            console.error('✗ خطأ في أمر الشات:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${error.message || error.toString()}`
            }, { quoted: msg });
        }
    }
};