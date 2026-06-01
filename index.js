require('dotenv').config();

const express = require('express');
const path = require('path');
const pino = require('pino');

const {
    default: EliteProTechConnect,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

const {
    EliteProTechId,
    generateRandomCode
} = require('./ids');

const mainCommands = require('./commands/main');
const aiCommands = require('./commands/ai');

const app = express();

const PORT = process.env.PORT || 3000;

const sessionDir = path.join(__dirname, 'session');

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

app.get('/', async (req, res) => {

    const id = EliteProTechId();

    let num = req.query.number;

    if (!num) {
        return res.json({
            error: 'Number parameter missing'
        });
    }

    async function startBot() {

        const { version } =
            await fetchLatestBaileysVersion();

        const { state, saveCreds } =
            await useMultiFileAuthState(
                path.join(sessionDir, id)
            );

        const sock = EliteProTechConnect({

            version,

            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    pino({ level: 'fatal' })
                )
            },

            logger: pino({ level: 'fatal' }),

            browser: Browsers.macOS('Safari'),

            printQRInTerminal: false
        });

        sock.ev.on('creds.update', saveCreds);

        if (!sock.authState.creds.registered) {

            num = num.replace(/[^0-9]/g, '');

            const code =
                await sock.requestPairingCode(
                    num,
                    generateRandomCode()
                );

            return res.json({
                code,
                session_id: id
            });
        }

        sock.ev.on('messages.upsert', async ({
            messages,
            type
        }) => {

            if (type !== 'notify') return;

            const msg = messages[0];

            if (!msg.message) return;

            const sender =
                msg.key.remoteJid;

            let text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                '';

            text = text.trim();

            if (!text) return;

            const [cmd, ...args] =
                text.split(/\s+/);

            const command =
                cmd.toLowerCase().replace('.', '');

            await mainCommands({
                sock,
                sender,
                command,
                args,
                msg
            });

            await aiCommands({
                sock,
                sender,
                command,
                args,
                msg
            });

        });

        sock.ev.on('connection.update', ({
            connection
        }) => {

            if (connection === 'open') {
                console.log('✅ Connected');
            }

            if (connection === 'close') {

                console.log('⚠️ Reconnecting...');

                setTimeout(() => {
                    startBot();
                }, 5000);

            }

        });

    }

    startBot();

});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});