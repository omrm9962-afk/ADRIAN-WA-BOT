const { isElite } = require('../haykala/elite.js'); // أو المسار الصحيح للبوت عندك

module.exports = {
    command:'تهكير',
    description: 'تحليل الدولة والجهاز للمستخدم',
    usage: '.تحليل',

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || chatId;

        const phone = sender.split('@')[0];
        const prefix = phone.slice(0, 3);

        const data = {
            '212': { country: 'المغرب 🇲🇦', device: 'Samsung Galaxy A32', image: 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a32-4g-1.jpg' },
            '966': { country: 'السعودية 🇸🇦', device: 'iPhone 11 Pro', image: 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-11-pro-1.jpg' },
            '963': { country: 'سوريا 🇸🇾', device: 'Xiaomi Redmi Note 10', image: 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note10-1.jpg' },
            '20':  { country: 'مصر 🇪🇬', device: 'Oppo Reno 8', image: 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno8-1.jpg' },
            '964': { country: 'العراق 🇮🇶', device: 'Realme 9 Pro+', image: 'https://fdn2.gsmarena.com/vv/pics/realme/realme-9-pro-plus-1.jpg' },
            '971': { country: 'الإمارات 🇦🇪', device: 'Samsung Galaxy S22', image: 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s22-1.jpg' },
            '1':   { country: 'أمريكا 🇺🇸 / كندا 🇨🇦', device: 'iPhone 14 Pro Max', image: 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-max-1.jpg' },
            '90':  { country: 'تركيا 🇹🇷', device: 'Huawei Nova 9', image: 'https://fdn2.gsmarena.com/vv/pics/huawei/huawei-nova-9-1.jpg' }
        };

        const info = data[prefix] || { country: 'غير معروف', device: 'جهاز غير معروف', image: null };
        const os = info.device.toLowerCase().includes('iphone') ? 'iOS 🍏' :
                   info.device.toLowerCase().includes('huawei') ? 'HarmonyOS 🐉' :
                   'Android 🤖';

        const progressSteps = [
            '▮▯▯▯▯▯▯▯▯▯', '▮▮▯▯▯▯▯▯▯▯', '▮▮▮▯▯▯▯▯▯▯', '▮▮▮▮▯▯▯▯▯▯', '▮▮▮▮▮▯▯▯▯▯',
            '▮▮▮▮▮▮▯▯▯▯', '▮▮▮▮▮▮▮▯▯▯', '▮▮▮▮▮▮▮▮▯▯', '▮▮▮▮▮▮▮▮▮▯', '▮▮▮▮▮▮▮▮▮▮'
        ];

        let sentMsg;
        for (let i = 0; i < progressSteps.length; i++) {
            const text = `🛠️ جاري التحليل...\n${progressSteps[i]} ${ (i+1)*10 }%`;
            if (!sentMsg) {
                sentMsg = await sock.sendMessage(chatId, { text }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { text, edit: sentMsg.key }, { quoted: msg });
            }
            await new Promise(res => setTimeout(res, 500));
        }

        const finalText = `✅ تم التحليل بنجاح!
• 🌍 الدولة: ${info.country}
• 📱 نوع الجهاز المتوقع: ${info.device}
• 💻 نظام التشغيل: ${os}
📩 باقي المعلومات يتم إرسالها للمطور لاحقاً...`;

        await sock.sendMessage(chatId, { text: finalText }, { quoted: msg });

        if (info.image) {
            await sock.sendMessage(chatId, { image: { url: info.image }, caption: `📷 صورة الجهاز المتوقع: ${info.device}` }, { quoted: msg });
        }
    }
};