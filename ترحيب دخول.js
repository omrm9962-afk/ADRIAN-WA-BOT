const welcomedParticipants = new Set();
let welcomeActive = false;

module.exports = {
  command: 'تت',
  description: 'يرحب بالأعضاء الجدد عند انضمامهم إلى المجموعة.',
  category: 'group',

  async execute(sock, msg) {
    try {
      const groupId = msg.key.remoteJid;

      // إذا أول مرة يتفعل الترحيب
      if (!welcomeActive) {
        welcomeActive = true;
        await sock.sendMessage(groupId, {
          text: '✅ تم تفعيل الترحيب بالأعضاء الجدد.\n- اكتب "قفل الترحيب" لتعطيله.'
        });

        // مستمع الانضمام
        sock.ev.on('group-participants.update', async (update) => {
          try {
            if (!welcomeActive) return;
            if (update.id !== groupId) return;
            if (update.action !== 'add') return;

            const groupMetadata = await sock.groupMetadata(groupId);
            const groupName = groupMetadata.subject;

            for (const participant of update.participants) {
              if (welcomedParticipants.has(participant)) continue;

              let ppUrl = await sock.profilePictureUrl(participant, 'image').catch(() => null);
              if (!ppUrl) {
                ppUrl = await sock.profilePictureUrl(groupId, 'image').catch(() => null);
              }

              const welcomeMessage = `
*❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜*
❒ *╭┈⊰* 💡قمة النور 💡 *⊰┈ ✦*
*┊˹📯˼┊ اررحب تراحيب المطر 🌧️✨*
┊˹🥷🏻˼┊ @${participant.split('@')[0]}
┊📩 *شـوٌفُ آلَوٌصّـفُ يَحًـبً 📜*

> *منور الجروب ┊˹✅˼┊*
*❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜*
> 𝒀𝑨𝑴𝑨𝑻𝑶_𝑺𝒂𝒎𝒂 🕸
`;

              const media = ppUrl
                ? { image: { url: ppUrl }, caption: welcomeMessage }
                : { text: welcomeMessage };

              await sock.sendMessage(groupId, {
                ...media,
                mentions: [participant]
              });

              // منع التكرار
              welcomedParticipants.add(participant);
              setTimeout(() => welcomedParticipants.delete(participant), 60000);
            }
          } catch (err) {
            console.error('خطأ في الترحيب:', err);
          }
        });
      }

      // فحص الرسالة النصية
      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      if (text.trim() === 'قفل الترحيب') {
        welcomeActive = false;
        welcomedParticipants.clear();
        await sock.sendMessage(groupId, {
          text: '⛔ تم تعطيل الترحيب بالأعضاء الجدد.'
        });
      }
    } catch (err) {
      console.error('خطأ في أمر الترحيب:', err);
    }
  }
};