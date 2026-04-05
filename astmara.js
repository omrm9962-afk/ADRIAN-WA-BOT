module.exports = {
    command: 'استمارة',
    description: 'استمارة لجروبات الاستقبال.. ',
    usage: 'استمارة',
    category: 'group',    
    
    async execute(sock, msg) {
        try {
            const decoratedText = `*「 • الـلقـب ❔┃」*
*「  •الانـمـي ✍🏻┃ 」*
*「 • الـجنــس 👥┃ 」*
*「  •طـرف مـيـن❔@⁨ 
> *شــرح الاسـتـمـاره*
> [القب] عليك بختيار لقب شخصيه من الانمي ليناديك فيها الاعضاء

> [الانمي] عليك بكتب الانمي الذي اخترت منه الشخصيه واللقب

> [الجنس] عليك بكتب جنسك ولد ولا بنت؟

> [طرف مين] عليك باخبارنا من اين حصلت على الرابط وكيف دخلت الجروب

*❆•╾━─━╌ •⤣🌕⤤• ╌━─╾━•❆*
> *مـلـحـوظــــات ↻*

*لا يـجـوز ولـد يـخـتـار شـخـصـية فـتـاة والـعـكـس صحـيـح..*

*اࢪفــاق صـوࢪة للــشـخـصـية مـ؏ الاسـتـمـارة*

*ان لـم تـمـلاء الاسـتـمــاࢪة خـلال 24 سـ سـيـتـم طـࢪدك*
*❆•╾━─━╌ •⤣🌕⤤• ╌━─╾━•❆*
*『𝑺.𝑯.𝑹⊰🌀⊱𝑲𝑶𝑵𝑶𝑯𝑨𓂀』*`

            await sock.sendMessage(msg.key.remoteJid, {
                text: decoratedText,
                mentions: [msg.sender]
            }, { quoted: msg });
        } catch (error) {
            console.error('❌', 'Error executing استمارة:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: responses.error.general(error.message || error.toString())
            }, { quoted: msg });
        }
    }
}