module.exports = {
    command: 'اذكار-المساء',
    description: 'أذكار المساء',
    usage: '.مسائية',
    category: 'ديني',    
    
    async execute(sock, msg) {
        try {
            const decoratedText = `> 🌙 *أذكار المساء* 🌙\n
- 1. *اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.*

- 2. *أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.*

- 3. *اللهم إني أسألك خير هذه الليلة: فتحها، ونصرها، ونورها، وبركتها، وهداها، وأعوذ بك من شر ما فيها وشر ما بعدها.*

- 4. *اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت.*

- 5. *أعوذ بكلمات الله التامات من شر ما خلق.* (3 مرات)

- 6. *بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.* (3 مرات)

- 7. *سورة الإخلاص، الفلق، الناس* (3 مرات لكل سورة`;
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