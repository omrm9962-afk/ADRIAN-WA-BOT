const { getPlugins } = require('../handlers/plugins.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  status: "on",
  name: 'Bot Commands',
  command: ['menu'],
  category: 'tools',
  description: 'قائمة الأوامر بحسب الفئة',
  hidden: false,
  version: '3.0',

  async execute(sock, msg) {
    try {
      const zarfData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'zarf.json')));
      const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
      const args = body.trim().split(' ').slice(1);
      const plugins = getPlugins();
      const categories = {};

      // تجميع الأوامر حسب الفئات وتنسيقها
      Object.values(plugins).forEach((plugin) => {
        if (plugin.hidden) return;
        const category = plugin.category?.toLowerCase() || 'others';
        if (!categories[category]) categories[category] = [];

        let commandDisplay = '';
        if (Array.isArray(plugin.command) && plugin.command.length > 1) {
          commandDisplay = `- ${plugin.command.map(cmd => `\`${cmd}\``).join(' - ')}`;
        } else {
          const cmd = Array.isArray(plugin.command) ? plugin.command[0] : plugin.command;
          commandDisplay = `- \`${cmd}\``;
        }

        if (plugin.description) {
          commandDisplay += `\nDescription: \`\`\`${plugin.description}\`\`\``;
        }

        categories[category].push(commandDisplay);
      });

      let menu = '╭━━━━ 𝗔𝗗𝗥𝗜𝗔𝗡 𝗪𝗔 𝗕𝗢𝗧 ━━━━╮\n│ 🌴 Developed by DRVELOPER\n│ Codename: A D R I A N\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n';
      
      // مسارات الوسائط في مجلد "مارو"
      const videoPath = path.join(__dirname, '..', 'مارو', 'menu.mp4');
      const audioPath = path.join(__dirname, '..', 'مارو', 'menu.mp3');

      if (args.length === 0) {
        // --- الحالة الأولى: طلب القائمة العامة (.menu بس) ---
        menu += '╭─── 🗂️ CATEGORIES ───\n';
        for (const cat of Object.keys(categories)) {
          menu += `│ ◦ \`${cat}\`\n`;
        }
        menu += '╰────────────────────\n';
        menu += '\n💡 Write `.menu [Category]` to view commands.\n';
        menu += '\n╭─INFO─╮\n│ 💠 Thanks for using ADRIAN\n│ 📡 Telegram : *@ANM_IV*\n╰────────╯';

        // 1. إرسال الفيديو مع النص
        if (fs.existsSync(videoPath)) {
          await sock.sendMessage(msg.key.remoteJid, {
            video: fs.readFileSync(videoPath),
            caption: menu,
            gifPlayback: false 
          }, { quoted: msg });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { text: menu }, { quoted: msg });
        }

        // 2. إرسال ملف الصوت (menu.mp3) كريكورد
        if (fs.existsSync(audioPath)) {
          await sock.sendMessage(msg.key.remoteJid, {
            audio: fs.readFileSync(audioPath),
            mimetype: 'audio/mp4',
            ptt: false 
          }, { quoted: msg });
        }
        return; // إنهاء التنفيذ هنا

      } else {
        // --- الحالة الثانية: طلب فئة معينة (بدون فيديو وصوت) ---
        const requestedCategory = args.join(' ').toLowerCase();
        if (!categories[requestedCategory]) {
          return await sock.sendMessage(msg.key.remoteJid, {
            text: `❌ The Category *${requestedCategory}* was not found.\nWrite \`.menu\` to see all.`
          }, { quoted: msg });
        }

        menu += `╭─❒ *${requestedCategory.toUpperCase()}*\n`;
        menu += categories[requestedCategory].join('\n\n');
        menu += '\n╰──────────────\n';
        menu += '\n╭─INFO─╮\n│ 👑 ADRIAN WA BOT\n╰────────╯';

        // إرسال صورة لو مفعلة في zarf.json، غير كدة نص بس
        if (zarfData.media?.status === 'on' && zarfData.media.image) {
          const imgPath = path.join(process.cwd(), zarfData.media.image);
          if (fs.existsSync(imgPath)) {
            return await sock.sendMessage(msg.key.remoteJid, {
              image: fs.readFileSync(imgPath),
              caption: menu
            }, { quoted: msg });
          }
        }
        
        await sock.sendMessage(msg.key.remoteJid, { text: menu }, { quoted: msg });
      }

    } catch (error) {
      console.error('❌ Menu Error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء إنشاء القائمة.' }, { quoted: msg });
    }
  }
};
