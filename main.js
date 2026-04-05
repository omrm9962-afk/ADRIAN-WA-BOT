const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const pino = require('pino');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { exec } = require('child_process');
const logger = require('./utils/console');

const question = text => new Promise(resolve => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(text, answer => {
        rl.close();
        resolve(answer);
    });
});

function playSound(name) {
    const controlPath = path.join(__dirname, 'اصوات', 'صوت.txt');
    const status = fs.existsSync(controlPath) ? fs.readFileSync(controlPath, 'utf-8').trim() : 'off';
    if (status !== '{on}') return;
    const filePath = path.join(__dirname, 'sounds', name);
    if (fs.existsSync(filePath)) exec(`mpv --no-terminal --really-quiet "${filePath}"`);
}

async function startBot() {
    try {
        console.clear();
          console.log(chalk.bold("\n           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  console.log(chalk.bold.magentaBright("          ┋  𝗦𝗧𝗔𝗥𝗧𝗜𝗡𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗬 『 𝗔𝗗𝗥𝗜𝗔𝗡 𝗪𝗔 𝗕𝗢𝗧 』┋ 🍎  \n"));
  console.log(chalk.bold("           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  
  console.log(chalk.bold.greenBright('             𝗔𝗗𝗥𝗜𝗔𝗡 𝗕𝗢𝗧 𝑰𝑺 𝑶𝑵𝑳𝑰𝑵𝑬 𝑵𝑶𝑾..!! 🇵🇸\n\n'));
  
    
  console.log(chalk.bold.redBright('        WELCOME TO ADRIAN BOT..!! 🍎 \n\n'));

        playSound('YAMATO.mp3');

        const sessionDir = path.join(__dirname, 'session');
        await fs.ensureDir(sessionDir);

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            browser: ['MacOs', 'Chrome', '1.0.0'],
            logger: pino({ level: 'silent' }),
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true
        });

        // تحميل بيانات المجموعات
        sock.ev.on('groups.upsert', async (groups) => {
            for (const group of groups) {
                try {
                    await sock.groupMetadata(group.id);
                    console.log(`[+] تم تحميل بيانات مجموعة: ${group.subject}`);
                } catch (err) {
                    console.warn(`[-] فشل في تحميل بيانات مجموعة: ${group.id}`);
                }
            }
        });

        // إعداد الربط لأول مرة
        if (!sock.authState.creds.registered) {
            console.log(chalk.bold('\n[ SETUP ] Please enter your phone number to receive the pairing code:'));
            console.log(chalk.dim('          (Type "#" to cancel)\n'));

            let phoneNumber = await question(chalk.bgHex('#FFD700').black(' Phone Number : '));
            if (phoneNumber.trim() === '#') process.exit();

            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            if (!phoneNumber.match(/^\d{10,15}$/)) {
                console.log("\n[ ERROR ] Invalid phone number.\n");
                process.exit(1);
            }

            try {
                sock.version = version;
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('\n────────── Pairing Information ──────────');
                console.log(chalk.greenBright(`Pairing Code: ${code}`));
                console.log(chalk.cyanBright(`Phone Number: ${phoneNumber}`));
                console.log('─────────────────────────────────────────\n');
            } catch (error) {
                console.log("\n[ ERROR ] Failed to get pairing code. Trying QR as backup...\n");
                sock.printQRInTerminal = true;
            }
        }

        // تحديثات الاتصال
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'connecting') {
                logger.info('Connecting to WhatsApp...');
            }

            if (connection === 'open') {
                logger.success(chalk.greenBright.bold(`CONNECTED! USER ID: ${sock.user.id}`));

                try {
                    const { addEliteNumber } = require('./haykala/elite');
                    const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
                    const jid = `${botNumber}@s.whatsapp.net`;

                    const [info] = await sock.onWhatsApp(jid);
                    if (!info?.jid || !info?.lid) {
                        logger.error('تعذر الحصول على معلومات الجلسة من onWhatsApp');
                        return;
                    }

                    const lidNumber = info.lid.replace(/[^0-9]/g, '');
                    await addEliteNumber(botNumber);
                    await addEliteNumber(lidNumber);

                    logger.info(chalk.cyanBright(`✅ ADDED ${botNumber} AND ${lidNumber} TO ELITE!`));
                } catch (e) {
                    logger.error('⚠️ فشل في إضافة رقم الجلسة إلى النخبة:', e.message);
                }

                require('./handlers/handler').handleMessagesLoader();
                listenToConsole(sock);
            }

            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                logger.warn(`Disconnected (${reason || 'unknown'})`);

                if (reason === DisconnectReason.loggedOut) {
                    playSound('LOGGOUT.mp3');
                    logger.error(chalk.red.bold('You have been logged out.'));
                    process.exit(1);
                } else {
                    logger.info(chalk.yellow('🔁 Reconnecting in 3 seconds...'));
                    setTimeout(startBot, 3000);
                }
            }
        });

        // استقبال الرسائل
        sock.ev.on('messages.upsert', async (m) => {
            try {
                const { handleMessages } = require('./handlers/handler');
                await handleMessages(sock, m);
            } catch (err) {
                logger.error('Error while handling message:', err);
                playSound('ERROR.mp3');
            }
        });

        // مراقبة تغييرات المجموعات
        sock.ev.on('group-participants.update', async (update) => {
            try {
                const antiAdmin = require('./plugins/antiAdminAbuse');
                await antiAdmin.handleGroupUpdate(sock, update);
            } catch (err) {
                console.error('Error in antiAdminAbuse:', err);
            }
        });

        // حفظ الاعتمادات
        sock.ev.on('creds.update', saveCreds);

        // تجاهل رسائل الجلسات المكررة
        process.on('unhandledRejection', (err) => {
            if (!String(err).includes('Closing open session')) {
                console.error('Unhandled rejection:', err);
            }
        });

    } catch (err) {
        logger.error('Startup error:', err);
        playSound('ERROR.mp3');
        setTimeout(startBot, 3000);
    }
}

function listenToConsole(sock) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', () => console.log('[ CMD ] Unknown command.'));
}

startBot();