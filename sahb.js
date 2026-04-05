// plugins/sahb.js
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'سحب',
  description: 'يسحب أي صورة/فيديو/رسالة صوتية من الرسالة المردود عليها (حتى لو مرة واحدة) ويبعتها تاني',
  group: false,
  elite: false,
  usage: '.سحب (لازم ترد على الميديا)',
  execute: async (sock, msg) => {
    try {
      const ci = msg.message?.extendedTextMessage?.contextInfo;
      const quoted = ci?.quotedMessage;
      if (!quoted) {
        return await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ لازم ترد على صورة أو فيديو أو رسالة صوتية.' }, { quoted: msg });
      }

      const unwrap = (m) => {
        let x = m;
        if (x?.ephemeralMessage) x = x.ephemeralMessage.message;
        if (x?.viewOnceMessageV2) x = x.viewOnceMessageV2.message;
        if (x?.viewOnceMessageV2Extension) x = x.viewOnceMessageV2Extension.message;
        if (x?.viewOnceMessage) x = x.viewOnceMessage.message;
        return x;
      };
      const inner = unwrap(quoted);

      const mediaMsg = inner?.imageMessage || inner?.videoMessage || inner?.audioMessage;
      if (!mediaMsg) {
        return await sock.sendMessage(msg.key.remoteJid, { text: '❌ الرسالة المردود عليها مش صورة ولا فيديو ولا رسالة صوتية.' }, { quoted: msg });
      }

      const qKey = ci?.stanzaId
        ? {
            remoteJid: msg.key.remoteJid,
            fromMe: false,
            id: ci.stanzaId,
            participant: ci.participant,
          }
        : msg.key;

      const quotedWAMessage = {
        key: qKey,
        message: inner,
      };

      const buffer = await downloadMediaMessage(
        quotedWAMessage,
        'buffer',
        {},
        { logger: console, reuploadRequest: sock.updateMediaMessage }
      );

      if (mediaMsg.mimetype?.startsWith('image/')) {
        await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: '📤 تم السحب' }, { quoted: msg });
      } else if (mediaMsg.mimetype?.startsWith('video/')) {
        await sock.sendMessage(msg.key.remoteJid, { video: buffer, caption: '📤 تم السحب' }, { quoted: msg });
      } else if (mediaMsg.mimetype?.startsWith('audio/')) {
        await sock.sendMessage(msg.key.remoteJid, { audio: buffer, mimetype: mediaMsg.mimetype, ptt: mediaMsg.ptt || false }, { quoted: msg });
      } else {
        if (inner?.audioMessage) {
          await sock.sendMessage(msg.key.remoteJid, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: inner.audioMessage.ptt || false }, { quoted: msg });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { document: buffer, fileName: 'media', mimetype: mediaMsg.mimetype || 'application/octet-stream' }, { quoted: msg });
        }
      }

      // رياكت على رسالتك أنت
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: '📤', key: msg.key },
      });

      // رياكت على الرسالة اللي اتسحبت منها الميديا
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: '📤', key: qKey },
      });

    } catch (err) {
      console.error('سحب: ', err);
      const short = ('' + (err?.message || err)).slice(0, 180);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ حصل خطأ أثناء السحب\n${short}` }, { quoted: msg });
    }
  },
};