const axios = require('axios');

const AI_API_KEY =
    process.env.AI_API_KEY;

const chats = new Map();

module.exports = async ({
    sock,
    sender,
    command,
    args
}) => {

    if (
        !['ai', 'ask']
        .includes(command)
    ) return;

    if (!args[0]) {

        return await sock.sendMessage(sender, {
            text:
'Ask a question.'
        });

    }

    const question =
        args.join(' ');

    const history =
        chats.get(sender) || [];

    history.push({
        role: 'user',
        content: question
    });

    try {

        const response =
            await axios.post(

                'https://api.anthropic.com/v1/messages',

                {
                    model:
'claude-haiku-4-5-20251001',

                    max_tokens: 1024,

                    messages: history
                },

                {
                    headers: {

                        'x-api-key':
                            AI_API_KEY,

                        'anthropic-version':
                            '2023-06-01',

                        'content-type':
                            'application/json'
                    }
                }
            );

        const answer =
            response.data
            ?.content?.[0]?.text
            || 'No response';

        history.push({
            role: 'assistant',
            content: answer
        });

        chats.set(
            sender,
            history.slice(-10)
        );

        return await sock.sendMessage(sender, {
            text: answer
        });

    } catch (err) {

        console.error(err.message);

        return await sock.sendMessage(sender, {
            text:
'❌ AI failed to respond.'
        });

    }

};