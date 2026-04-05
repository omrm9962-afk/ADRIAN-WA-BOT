// هـنـا حـقـوق الـمـطـوࢪ عـمـڪ كـيـلـوا او مـاࢪو تعـدل امـڪ تـڪـون اغـلـۍ مَ عـنـدۍ 🥷🏻🌪
// 𝗔𝗗𝗥𝗜𝗔𝗡 𝗡𝗢𝗥𝗧𝗛 

const fs = require('fs');
const path = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');
const { isElite } = require('../haykala/elite.js');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'المطور',
    description: 'يعرض معلومات المطور مع فيديو وصوت وبطاقة رقم',
    usage: '.المطور',
    category: 'إدارة',
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

            // مسارات الملفات
            const videoPath = path.join(__dirname, '..', 'مارو', 'Developer.mp4');
            const audioPath = path.join(__dirname, '..', 'مارو', 'Developer.mp3');

            // تجهيز النص الشامل (المعلومات + القوانين)
            const fullCaption = `
*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*
╭──── INFO ────╮
│ *✮ ⃟🛡️╎:「𝗔𝗗𝗥𝗜𝗔𝗡 𝗡𝗢𝗥𝗧𝗛」*
│ *_⌬ الــــــرقـــم :_*
│ *✮ ⃟🛡️╎:「Everything down ↯↯」*
╰──────────────╯

📜 *قوانين التواصل مع المطور:*
1. لا ترسل سبام أو رسائل متكررة.
2. اكتب كل ما تحتاجه في رسالة واحدة.
3. المراسلة للأعطال أو الاستفسارات الهامة فقط.
4. يمنع تجربة الأوامر في الخاص.
5. الاحترام المتبادل شرط أساسي للتواصل.

*⚠️ مخالفة القوانين تعرضك للحظر الفوري.*
*𑁍━─━═━꒰⛩️꒱━═━─━ 𑁍*
`.trim();

            // 1. إرسال الفيديو مع النص (Caption)
            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(chatId, { 
                    video: fs.readFileSync(videoPath), 
                    caption: fullCaption, 
                    mentions: [sender],
                    gifPlayback: false 
                }, { quoted: msg });
            } else {
                // إذا لم يوجد فيديو يرسل النص فقط
                await sock.sendMessage(chatId, { text: fullCaption }, { quoted: msg });
            }

            // 2. إرسال بطاقة الاتصال (VCard)
            const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:#Adrian North
TEL;type=CELL;type=VOICE;waid=201204130538:+201204130538
END:VCARD
            `.trim();

            await sock.sendMessage(chatId, {
                contacts: { displayName: '#Adrian North', contacts: [{ vcard }] }
            }, { quoted: msg });

            // 3. إرسال الملف الصوتي
            if (fs.existsSync(audioPath)) {
                await sock.sendMessage(chatId, { 
                    audio: fs.readFileSync(audioPath), 
                    mimetype: 'audio/mp4', 
                    ptt: false // خليتها true عشان يتبعت كأنه ريكورد (نوتة صوتية)
                }, { quoted: msg });
            }

        } catch (err) {
            console.error('❌ خطأ في تنفيذ أمر المطور:', err.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ فشل تنفيذ أمر المطور.' }, { quoted: msg });
        }
    }
};
