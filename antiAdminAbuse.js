const chalk = require('chalk');

let antiAdminGroups = new Set();

module.exports = {
    command: "حماية2",
    desc: "نظام لكل فعل رد فعل: لو حد شال إشراف من حد، البوت يشيله هو كمان.",
    group: true,

    async execute(sock, m) {
        const from = m.key.remoteJid;

        if (antiAdminGroups.has(from)) {
            antiAdminGroups.delete(from);
            await sock.sendMessage(from, { text: "❌ تم إيقاف نظام *لكل فعل رد فعل* في هذا الجروب." });
        } else {
            antiAdminGroups.add(from);
            await sock.sendMessage(from, { text: "✅ تم تفعيل نظام *لكل فعل رد فعل* في هذا الجروب." });
        }
    },

    async handleGroupUpdate(sock, update) {
        try {
            const { id: groupId, participants, action, actor } = update;
            if (!groupId || !participants || !action || !actor) return;
            if (!antiAdminGroups.has(groupId)) return;

            const actorNum = actor.split('@')[0];
            const targetNum = participants[0]?.split('@')[0];

            if (action === 'promote') {
                await sock.sendMessage(groupId, { 
                    text: `⚙️ *${actorNum}* أعطى إشراف لـ *${targetNum}*.` 
                });
            } 
            else if (action === 'demote') {
                await sock.sendMessage(groupId, { 
                    text: `🚫 *${actorNum}* شال إشراف *${targetNum}*\n⚠️ لكل فعل رد فعل!\n🧨 تم سحب إشراف *${actorNum}* كمان!` 
                });
                await sock.groupParticipantsUpdate(groupId, [actor], 'demote');
            }
        } catch (err) {
            console.error(chalk.red('[AntiAdmin Error]'), err);
        }
    }
};