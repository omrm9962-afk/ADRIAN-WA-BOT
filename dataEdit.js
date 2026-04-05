const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { isElite } = require('../haykala/elite.js');

const zarfPath = path.join(process.cwd(), 'zarf.json');
const mediaDir = path.join(process.cwd(), 'مارو');
const imagePath = path.join(mediaDir, 'zarf.jpg');
const audioPath = path.join(mediaDir, 'zarf.mp3');

module.exports = {
    command: 'edit',
    description: 'تعديل إعدادات الزرف عبر الرد على الرسالة',
    category: 'tools',
    usage: '.edit [اسم|وصف|منشن|رسالة|رياكت|صورة|صوت] [شغل|طفي]',

    async execute(sock, msg) {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderNum = sender.split('@')[0];
            const chat = msg.key.remoteJid;

            if (!isElite(senderNum)) {
                return sock.sendMessage(chat, { text: '❌ هذا الأمر مخصص للنخبة فقط.' }, { quoted: msg });
            }

            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const args = text.trim().split(/\s+/);
            const type = args[1]?.toLowerCase();
            const toggle = args[2]?.toLowerCase();
            const reply = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            const zarfData = fs.existsSync(zarfPath) ? JSON.parse(fs.readFileSync(zarfPath)) : {};

            const helpText = `
                  

╭──────INFO─────╮
│ Use:
│.edit اسم ← تعديل الاسم
│.edit وصف ← تعديل الوصف
│.edit رسالة ← تعديل الرسالة النهائية
│.edit منشن ← تعديل رسالة المنشن
│.edit رياكت ← تعديل التفاعل
│.edit صورة ← تحديث صورة الزرف (رد على صورة)
│.edit صوت ← تحديث الصوت (رد على صوت أو ملف)
│And.. 
│.edit [نوع] شغل / طفي 
╰─── 𝗔𝗗𝗥𝗜𝗔𝗡 ───📡 TELE──@ANM_IV──╯


`;

            const sendHelp = () => sock.sendMessage(chat, { text: helpText }, { quoted: msg });

            if (!type) return sendHelp();

            const setStatus = (section, value) => {
                if (['شغل', 'طفي'].includes(value)) {
                    const status = value === 'شغل' ? 'on' : 'off';
                    zarfData[section] = zarfData[section] || {};
                    zarfData[section].status = status;
                    fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                    sock.sendMessage(chat, { text: `✅ تم ${status === 'on' ? 'تشغيل' : 'إيقاف'} ${type}.` }, { quoted: msg });
                    return true;
                }
                return false;
            };

            switch (type) {
                case 'اسم':
                    if (setStatus('group', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.group = zarfData.group || {};
                        zarfData.group.newSubject = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(chat, { text: '✅ تم تعديل الاسم بنجاح.' }, { quoted: msg });
                    }
                    break;

                case 'وصف':
                    if (setStatus('group', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.group = zarfData.group || {};
                        zarfData.group.newDescription = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(chat, { text: '✅ تم تعديل الوصف بنجاح.' }, { quoted: msg });
                    }
                    break;

                case 'منشن':
                    if (setStatus('messages', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.messages = zarfData.messages || {};
                        zarfData.messages.mention = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(chat, { text: '✅ تم تعديل المنشن بنجاح.' }, { quoted: msg });
                    }
                    break;

                case 'رسالة':
                    if (setStatus('messages', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.messages = zarfData.messages || {};
                        zarfData.messages.final = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(chat, { text: '✅ تم تعديل الرسالة النهائية بنجاح.' }, { quoted: msg });
                    }
                    break;

                case 'رياكت':
                    if (setStatus('reaction', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.reaction = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(chat, { text: '✅ تم تعديل الرياكت بنجاح.' }, { quoted: msg });
                    }
                    break;

                case 'صورة':
                    if (setStatus('media', toggle)) return;
                    const imageMessage = reply?.imageMessage;
                    if (imageMessage) {
                        const buffer = await downloadMediaMessage({ message: { imageMessage } }, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
                        fs.mkdirSync(mediaDir, { recursive: true });
                        fs.writeFileSync(imagePath, buffer);
                        zarfData.media = zarfData.media || {};
                        zarfData.media.image = 'مارو/zarf.jpg';
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(chat, { text: '✅ تم تحديث صورة الزرف.' }, { quoted: msg });
                    }
                    break;

                case 'صوت':
                    if (setStatus('audio', toggle)) return;
                    const audioMsg = reply?.audioMessage || reply?.documentMessage;
                    if (audioMsg) {
                        const buffer = await downloadMediaMessage({ message: reply }, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
                        fs.mkdirSync(mediaDir, { recursive: true });
                        fs.writeFileSync(audioPath, buffer);
                        zarfData.audio = zarfData.audio || {};
                        zarfData.audio.file = 'مارو/zarf.mp3';
                        zarfData.audio.status = 'on';
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(chat, { text: '✅ تم تحديث الصوت بنجاح.' }, { quoted: msg });
                    }
                    break;

                default:
                    return sendHelp();
            }

            return sendHelp();
        } catch (err) {
            console.error('✗ خطأ في أمر edit:', err);
            return sock.sendMessage(msg.key.remoteJid, { text: `❌ حدث خطأ:\n${err.message}` }, { quoted: msg });
        }
    }
};