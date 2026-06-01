const axios = require('axios');
const yts = require('yt-search');

const POWERED_BY =
    '\n\nPowered by N£M£$I$-MD';

const OWNER =
    'Sir_JID';

module.exports = async ({
    sock,
    sender,
    command,
    args
}) => {

    if (command === 'ping') {

        return await sock.sendMessage(sender, {
            text: '🏓 Pong!' + POWERED_BY
        });

    }

    if (command === 'alive') {

        return await sock.sendMessage(sender, {
            text:
`🌟 N£M£$I$-MD is online!` +
POWERED_BY
        });

    }

    if (
        command === 'menu' ||
        command === 'help'
    ) {

        return await sock.sendMessage(sender, {
            text:
`╭──〔 N£M£$I$-MD 〕──╮

ping
alive
menu
meme
ytdl
ai

╰────────────────╯`
        });

    }

    if (command === 'owner') {

        return await sock.sendMessage(sender, {
            text:
`👑 Owner: ${OWNER}`
        });

    }

    if (command === 'meme') {

        try {

            const response =
                await axios.get(
                    'https://meme-api.com/gimme'
                );

            const meme = response.data;

            return await sock.sendMessage(sender, {
                image: {
                    url: meme.url
                },
                caption:
`${meme.title}

❤️ ${meme.ups} upvotes`
            });

        } catch {

            return await sock.sendMessage(sender, {
                text: '❌ Failed to fetch meme'
            });

        }

    }

    if (
        ['ytdl', 'ytmp3']
        .includes(command)
    ) {

        if (!args[0]) {

            return await sock.sendMessage(sender, {
                text:
'Provide YouTube link or search'
            });

        }

        try {

            let input =
                args.join(' ');

            if (
                !input.includes('youtube.com') &&
                !input.includes('youtu.be')
            ) {

                const search =
                    await yts(input);

                input =
                    search.videos[0].url;

            }

            const api =
`https://api-abztech.zone.id/download/ytdlv3?url=${encodeURIComponent(input)}`;

            const response =
                await axios.get(api);

            const data =
                response.data;

            const audio =
                await axios.get(
                    data.downloadUrl,
                    {
                        responseType:
                            'arraybuffer'
                    }
                );

            return await sock.sendMessage(sender, {

                audio:
                    Buffer.from(audio.data),

                mimetype:
                    'audio/mpeg',

                fileName:
                    `${data.title}.mp3`

            });

        } catch {

            return await sock.sendMessage(sender, {
                text:
'❌ Failed to download audio'
            });

        }

    }

};