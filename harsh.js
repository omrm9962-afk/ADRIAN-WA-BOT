module.exports = {
    command: 'تحرش',
    description: 'يرسل مقولة تحرش رومانسية عنيفة جداا مع إيموجيات حررة لما ترد أو تعمل منشن',
    group: false,
    elite: false,
    usage: '*رد على رسالة أو منشن شخص واكتب .تحرش*',
    execute: async (sock, msg) => {
        try {
            const isReply = !!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (!isReply && (!mentioned || mentioned.length === 0)) {
                await sock.sendMessage(msg.key.remoteJid, { text: '*⚠️ لازم ترد على رسالة أو تعمل منشن لشخص عشان تستخدم الأمر.*' }, { quoted: msg });
                return;
            }

            // مقولات رومانسية أكتر مع إيموجيات وكأس
            const quotes = [
                "*💍 هل أنتِ نغم؟ لأنكِ تعزفين قلبي بلمسة خاصة 🫦🍷.*",
                "*🌹 شفتيك سر عالمي، وحبي لكِ مالوش حدود 💖🍷.*",
                "*✨ قلبي عقد قرانه على ضحكتك، يا أجمل لحن 🎶🍷.*",
                "*🌊 عيونك بحر غامض، وأنا غريق فيه بلا رجعة 💘🍷.*",
                "*🔥 لما تلمسيني، يحكي قلبي قصة عشق ما لها نهاية 💫🍷.*",
                "*🥂 سحر عيونك خدني في دوامة، ما أقدر أهرب منها 🍷.*",
                "*🍷 بين كأس الونسة وعيونك، قلبي وقع في حفلة عشق 🎉.*",
                "*💫 أنتِ أجمل قصة كتبتها الأقدار في حياتي 🥀🍷.*",
                "*🎇 وجودك جنبي هو عيد قلبي كل يوم 🌟🍷.*",
                "*❤️ لما تضحكي، الشمس بتغار من نورك الساطع ☀️🍷.*",
                "*💌 صحيت الصبح ناسي اسمك، لڪن فاكر لمسة ايدي لجسمڪ 🌿🍷.*", 
                "*🎀 جـمـالـڪ ربـاني، ولا دا ورم ف بضـانـي 🐤💔.*", 
                "*🎀 مـتـيـجـي احـضـنك مـن وره، بـس جـيـلُٰٖ هـام 🫦🐤.*" 
                  ];

            // اختيار مقولة عشوائية
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

            // هنا هنحدد الـ jid للشخص اللي رديت على رسالته أو منشنته
            let targetJid = null;
            if (isReply) {
                // جلب جِد الرسالة المقتبسة
                targetJid = msg.message.extendedTextMessage.contextInfo.participant || msg.key.participant;
            } else if (mentioned && mentioned.length > 0) {
                targetJid = mentioned[0]; // ناخد أول منشن
            }

            // عمل منشن في الرسالة للنص
            const mentionText = `@${targetJid.split('@')[0]}`;
            const textToSend = `${mentionText}، ${randomQuote}`;

            // تفاعل (React) على الرسالة المقتبسة أو أول منشن (لو البايلس يدعم)
            try {
                if (isReply) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        react: {
                            text: '🫦',
                            key: msg.message.extendedTextMessage.contextInfo.stanzaId 
                                ? { 
                                    remoteJid: msg.key.remoteJid,
                                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                                    participant: msg.message.extendedTextMessage.contextInfo.participant || undefined,
                                } 
                                : msg.key
                        }
                    });
                }
            } catch (err) {
                // لو البوت مش بيدعم التفاعل أو حصل خطأ، نكمل عادي
            }

            // نرسل الرسالة مع منشن
            await sock.sendMessage(msg.key.remoteJid, {
                text: textToSend,
                mentions: [targetJid]
            }, { quoted: msg });

        } catch (error) {
            console.error('Error in تحرش command:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ حصل خطأ أثناء تنفيذ الأمر.' }, { quoted: msg });
        }
    }
};