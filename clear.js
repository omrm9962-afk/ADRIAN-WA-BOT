const fs = require('fs');
const path = require('path');

module.exports = {
    command: 'clear',
    description: 'حذف الملفات المتكررة في مجلد الجلسة دون فقدان الاتصال',
    usage: '.clear',

    async execute(sock, msg) {
        try {
            const sessionFolder = path.join(process.cwd(), 'session');
            const maxFiles = 50;

            if (!fs.existsSync(sessionFolder)) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '⚠️ مجلد الجلسة غير موجود!'
                }, { quoted: msg });
            }

            const files = fs.readdirSync(sessionFolder)
                .map(file => ({
                    name: file,
                    time: fs.statSync(path.join(sessionFolder, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time);

            if (files.length <= maxFiles) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: `✅ No wanttoclean! see ${files.length} files.`
                }, { quoted: msg });
            }

            const filesToDelete = files.slice(maxFiles);
            filesToDelete.forEach(file => {
                fs.unlinkSync(path.join(sessionFolder, file.name));
            });

            const message = `🧹 *Clean files ${filesToDelete.length} successfully!*`;
            await sock.sendMessage(msg.key.remoteJid, {
                text: message
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ خطأ أثناء تنظيف الجلسة:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ حدث خطأ أثناء محاولة تنظيف الجلسة.'
            }, { quoted: msg });
        }
    }
};