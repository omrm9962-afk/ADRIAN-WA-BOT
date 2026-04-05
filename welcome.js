module.exports = {
  command: 'ترحيب',
  category: 'group',
  description: '📢 ترحيب بالأعضاء الجدد',
  usage: '.ترحيب @عضو أو بالرد على رسالته',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    // المنشن (لو فيه)
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let target = mentioned.length > 0 ? mentioned[0] : null;

    // الرد على رسالة (لو مفيش منشن)
    if (!target && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      target = msg.message.extendedTextMessage.contextInfo.participant || null;
    }

    await sendWelcome(sock, chatId, msg, target);
  },

  async onGroupParticipantsUpdate(sock, update) {
    try {
      if (update.action === 'add') {
        const newMember = update.participants[0];
        await sendWelcome(sock, update.id, null, newMember);
      }
    } catch (err) {
      console.error('❌ خطأ في الترحيب التلقائي:', err);
    }
  }
};

async function sendWelcome(sock, chatId, msg = null, member = null) {
  try {
    const metadata = await sock.groupMetadata(chatId);
    const participants = metadata.participants || [];

    // العضو الجديد
    const tag = member ? `@${member.split('@')[0]}` : '';

    // عدد الأعضاء
    const memberCount = participants.length;

    // المشرفين
    const admins = participants
      .filter(p => p.admin !== null)
      .map(p => `@${p.id.split('@')[0]}`);

    // منشن مخفي للجميع
    const allMentions = participants.map(p => p.id);

    // صورة الجروب
    let pfp;
    try {
      pfp = await sock.profilePictureUrl(chatId, 'image');
    } catch {
      pfp = 'https://i.ibb.co/4fKDc9k/default-anime.jpg';
    }

    // صاحب البوت
    const ownerNumber = '201204130538@s.whatsapp.net'; // ✨ غيّر الرقم لرقمك
    const ownerName = '#Adrian North';

    // نص الترحيب
    const welcomeText = `ꪆৎ *اهـلا وسـهـلا بـڪ في جـࢪوب* ꪆৎ  
⋆𐙚 ̊.*┇${metadata.subject}┇* ⃝ 
﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌  
⋆𐙚 ̊.*المـنـشـن*: ${tag}  
💋 *انـࢪتـ/ي يـا حـب!* 🎉  

👑 *الـمـشـࢪفـيـن:* ${admins.length > 0 ? admins.join(', ') : 'لا يوجد'}  
👥 *عـدد الأعــضـاء:* ${memberCount}  

*اذا انـت بحـاجة الا شـيء نرجـو التواصل مع:*\n 
*الـمــ🌪ـطـوࢪ يَ صـديـقـۍ 🥷🏻* : ${ownerName} (@${ownerNumber.split('@')[0]})`;

    await sock.sendMessage(chatId, {
      image: { url: pfp },
      caption: welcomeText,
      mentions: [...allMentions, ...(member ? [member] : []), ownerNumber]
    }, msg ? { quoted: msg } : {});

  } catch (err) {
    console.error('❌ خطأ في sendWelcome:', err);
  }
}


// اذا فـي شـيء خـطاء او عـلـق مـعڪ انسـخ الـڪود وروح ل Chat gpt اي مـشكلـة حـلـها بنـفـسـك الاوامـر ايـزي بـس 🥷🏻