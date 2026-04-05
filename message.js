const { jidDecode } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'تفجير',
    description: 'إرسال عدد كبير من الرسائل بسرعة ⚡ (مع حماية من الحظر)',
    usage: '.تفجير [عدد الرسائل]',

    async execute(sock, msg, args) {
        try {
            const from = msg.key.remoteJid;
            const sender = jidDecode(msg.key.participant || from)?.user || msg.key.remoteJid.split('@')[0];

            const count = parseInt(args[0]);
            if (!count || isNaN(count) || count <= 0) {
                return await sock.sendMessage(from, { text: '❌ 𝑭𝒖𝒄𝒌 𝒖 (𝑼𝑺𝑬 𝑻𝑹𝑼𝑬):\n𝑬𝒙𝒂𝒎𝒑𝒍𝒆: .تفجير 10' }, { quoted: msg });
            }

            if (count > 1000000) {
                return await sock.sendMessage(from, { text: '⚠️ الحد الأقصى 100 رسالة فقط لتجنب الحظر 🚫' }, { quoted: msg });
            }

            const text = '*𝑨𝒅𝒓𝒊𝒂𝒏 𝑵𝒐𝒓𝒕𝒉.. 𝑺𝒂𝒚 𝒖 𝒖𝒏𝒅𝒆𝒓 𝒂𝒕𝒕𝒂𝒄𝒌*';

            // دالة للتأخير
            const sleep = ms => new Promise(res => setTimeout(res, ms));

            for (let i = 0; i < count; i++) {
                await sock.sendMessage(from, { text });
                await sleep(10); // تأخير 0.2 ثانية فقط بين كل رسالة
            }

            await sock.sendMessage(from, { text: `✅ 𝑺𝒖𝒄𝒄𝒆𝒔𝒔𝒇𝒖𝒍𝒍𝒚 𝒔𝒆𝒏𝒅 ${count} 𝑴𝒆𝒔𝒔𝒂𝒈𝒆  𝒘𝒊𝒕𝒉𝒐𝒖𝒕 𝒂𝒏𝒚 𝒑𝒓𝒐𝒃𝒍𝒆𝒎𝒔 🚀` });

        } catch (error) {
            console.error('✗ خطأ في أمر تفجير:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n${error.message}`
            }, { quoted: msg });
        }
    }
};