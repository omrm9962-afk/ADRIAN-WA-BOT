const { fork } = require('child_process');
const { join } = require('path');
const fs = require('fs-extra');
const logger = require('./utils/console');

const maxRetries = 3;
const retryDelay = 5000;

let isRunning = false;
let retryCount = 0;

function handleConnection(retry = 0) {
    const currentPath = process.cwd();
    const connectionFolder = join(currentPath, 'session');

    if (!fs.existsSync(connectionFolder)) {
        logger.warn('🪄 (File_connect) is not found..\n');
    }

    if (isRunning) return;
    isRunning = true;
    logger.info('🍷𝑾𝑨𝑰𝑻𝑰𝑵𝑮 𝑻𝑶 𝑺𝑻𝑨𝑹𝑻𝑰𝑵𝑮...--');

    const child = fork(join(__dirname, 'main.js'), [], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: {
            ...process.env,
            CONNECTION_FOLDER: connectionFolder
        }
    });

    child.on('message', (data) => {
        if (data === 'ready') {
            retryCount = 0;
            logger.success('✅ START BOT SUCCESSFULY.. ');
        } else if (data === 'reset') {
            logger.warn('🔄 RESTART THE BOT ORDERED...!');
            child.kill();
            setTimeout(() => handleConnection(0), 2000);
        } else if (data === 'uptime') {
            child.send(process.uptime());
        }
    });

    child.on('exit', async (code) => {
        isRunning = false;

        if (code === 0) {
            logger.info('✅ Off bot successfully and naturally.');
            return;
        }

        if (code === 429) {
            logger.warn('⚠️  TGAWZ AL HAD WAITING (10 Second)... ');
            await delay(10000);
            return handleConnection(retry);
        }

        if (retry < maxRetries) {
            retry++;
            logger.warn(`⚠️ RESTART (${retry}/${maxRetries}) After ${retryDelay / 1000} second...`);
            await delay(retryDelay);
            handleConnection(retry);
        } else {
            logger.error('❌ TAGAWZ AL HAD; STOP BOT NOW.. ');
            process.exit(1);
        }
    });

    child.on('error', (err) => {
        isRunning = false;
        logger.error(`❌ خطأ في العملية الفرعية: ${err}`);
        if (retry < maxRetries) {
            retry++;
            setTimeout(() => handleConnection(retry), retryDelay);
        }
    });

    
    setTimeout(() => {
        if (!child.connected) {
            logger.error('❌ CONNECT FAILD TO BOT; (THE BOT IS STOP) ');
            child.kill();
            handleConnection(retry + 1);
        }
    }, 10000);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


process.on('SIGINT', () => process.exit());

process.on('uncaughtException', (err) => {
    if (err.code === 'ECONNRESET' || err.code === 'rate-overlimit') {
        logger.warn('⚠️ تم تجاهل خطأ معروف.');
        return;
    }
    logger.error('❌ خطأ غير معالج:', err);
});

process.on('unhandledRejection', (reason) => {
    if (reason?.code === 429) {
        logger.warn('⚠️ TAGAWZ AL HAD Wait TO START');
        return;
    }
    logger.error('❌ وعد غير معالج:', reason);
});

logger.info('♠ 𝗦𝗧𝗔𝗥𝗧 𝗡𝗢𝗪..!! \n');
handleConnection();