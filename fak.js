// كـلو لاجل مارو ي عزيزي
const { eliteNumbers } = require('../haykala/elite');
const { jidDecode } = require('@whiskeysockets/baileys');
const decode = jid => (jidDecode(jid)?.user || jid.split('@'));

module.exports = {
  command: 'فك',
  description: 'يسحب الإشرافات من الكل ويعطيها للنخبة فقط',
  usage: '.فك',
  category: 'zarf',
  async execute(sock, msg) {
    try {
      const groupJid = msg.key.remoteJid;
      const sender = decode(msg.key.participant || msg.key.remoteJid);
      if (!groupJid.endsWith('@g.us')) return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط في القروبات.' }, { quoted: msg });
      if (!eliteNumbers.includes(sender)) return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });

      const groupMetadata = await sock.groupMetadata(groupJid);
      const botNumber = decode(sock.user.id);

      // يسحب الإشراف من الجميع ما عدا البوت والنخبة
      const toDemote = groupMetadata.participants
        .filter(p => p.admin && decode(p.id) !== botNumber && !eliteNumbers.includes(decode(p.id)))
        .map(p => p.id);

      if (toDemote.length > 0) {
        await sock.groupParticipantsUpdate(groupJid, toDemote, 'demote').catch(() => {});
      }

      // يعطي الإشراف لأي نخبة ما عنده إشراف
      const toPromote = groupMetadata.participants
        .filter(p => eliteNumbers.includes(decode(p.id)) && !p.admin && decode(p.id) !== botNumber)
        .map(p => p.id);

      if (toPromote.length > 0) {
        await sock.groupParticipantsUpdate(groupJid, toPromote, 'promote').catch(() => {});
      }

      await sock.sendMessage(groupJid, { text: '*لأجـــل مـاࢪو ي عـزيـزي 🐦‍🔥.*' }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(groupJid, { text: `❌ حدث خطأ:\n${err.message}` }, { quoted: msg });
    }
  }
};