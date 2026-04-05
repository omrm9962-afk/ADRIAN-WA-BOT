const ownerNumber = "201204130538@s.whatsapp.net"; // رقمك كأدمن دائم

module.exports = {
  command: "owner", // مجرد اسم شكلي عشان ما يتجاهلوش النظام
  desc: "يحمي الأدمن الأساسي من إزالة الإشراف تلقائيًا",
  group: true,

  async execute() {
    // مفيش تنفيذ مباشر (بس كده عشان النظام ما يتجاهلوش)
  },

  // دي أهم حاجة — event يشتغل تلقائي وقت التغييرات
  async onGroupParticipantsUpdate(sock, update) {
    try {
      const { id: groupId, participants, action, actor } = update;
      if (!groupId || !participants || !action || !actor) return;

      const removed = participants[0];

      // لو اللي اتشال من الإشراف هو الأدمن الأساسي
      if (action === 'demote' && removed === ownerNumber) {
        const actorNum = actor.split('@')[0];

        // ✅ يرجع الأدمن الأساسي فورًا
        await sock.groupParticipantsUpdate(groupId, [ownerNumber], 'promote');

        // ⚠️ يبعث تحذير
        await sock.sendMessage(groupId, {
          text: `🚨 *تحذير!* ${actorNum} حاول يشيل الإشراف من الأدمن الأساسي.\n👑 تم استرجاع الإشراف تلقائيًا ✅`
        });

        // 🚫 يشيل إشراف اللي حاول
        await sock.groupParticipantsUpdate(groupId, [actor], 'demote');
        await sock.sendMessage(groupId, {
          text: `⚖️ لكل فعل رد فعل.\n🚫 تم سحب إشراف *${actorNum}* كعقوبة.`
        });
      }
    } catch (err) {
      console.error("AntiOwner Error:", err);
    }
  }
};