
module.exports = {
    command: 'test',
    description: 'اختبار البوت',
    usage: '.test',
    category: 'tools',    
    
    async execute(sock, msg) {
        try {
            const decoratedText = ` *❆•╾━─━╌ •⤣🍷⤤• ╌━─╾━•❆*
ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ
𒅒          𒅒          𒅒          𒅒
ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ
*𝗔𝗗𝗥𝗜𝗔𝗡 𝗕𝗢𝗧 𝗪𝗢𝗥𝗞𝗜𝗡𝗚 𝗡𝗢𝗪, 𝗦𝗥*
ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ ٰ 
𒅒          𒅒          𒅒          𒅒
ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ ٖ
 *❆•╾━─━╌ •⤣🍷⤤• ╌━─╾━•❆*`

            await sock.sendMessage(msg.key.remoteJid, {
                text: decoratedText,
                mentions: [msg.sender]
            }, { quoted: msg });
        } catch (error) {
            console.error('❌', 'Error executing test:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: responses.error.general(error.message || error.toString())
            }, { quoted: msg });
        }
    }
};