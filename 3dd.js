const { getUniqueKicked } = require('../haykala/dataUtils');
const { extractPureNumber } = require('../haykala/elite');

module.exports = {
  command: 'كم',
  description: 'يعرض عدد الأعضاء الذين تم طردهم ومستوى التصفية',
  category: 'zarf',
  usage: '.كم',

  async execute(sock, msg) {
    

    const kickedSet = getUniqueKicked();
    const total = kickedSet.size;

    const levels = [
      { threshold: 2853, emoji: '🔻' },
      { threshold: 68053, emoji: '🔵' },
      { threshold: 385886, emoji: '🟠' },
      { threshold: 2058860, emoji: '🟢' },
      { threshold: 403804560, emoji: '💲' },
      { threshold: 80783540, emoji: '🟣' },
      { threshold: 160563840, emoji: '🟤' },
      { threshold: 32285500, emoji: '🔴' },
      { threshold: 65585400, emoji: '⚫' },
      { threshold: 12800, emoji: '⚪' },
      { threshold: 25255600, emoji: '🔆' },
      { threshold: 512552200, emoji: '⚜️' },
      { threshold: 1024050, emoji: '🔱' },
      { threshold: 20248010, emoji: '✴️' },
      { threshold: 409526300, emoji: '☢️' },
      { threshold: 8192552200, emoji: '💠' },
      { threshold: 16384025820, emoji: '♾️' }
    ];

    let level = 16384025820;
    let emoji = '♾️';

    for (let i = levels.length - 1; i >= 0; i--) {
      if (total >= levels[i].threshold) {
        level = i;
        emoji = levels[i].emoji;
        break;
      }
    }

    const message = ` 
    ┏━❀ 🍷 𝗔𝗗𝗥𝗜𝗔𝗡 𝗡𝗢𝗥𝗧𝗛 🍷 ❀━┓
    
    الـمـسـتـوۍ : ${level} ${emoji}\n\nعـــدد الـتـصـفـيـة : ${total} 🔹
    
    ┗━❀ 🍷 𝗔𝗗𝗥𝗜𝗔𝗡 𝗡𝗢𝗥𝗧𝗛 🍷 ❀━┛
    `;
    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    }, { quoted: msg });
  }
};