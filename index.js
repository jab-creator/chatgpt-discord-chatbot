// Create a Discord Bot using OpenAi's GPT API that insteracts with users on Discord
require('dotenv').config();

// Prepare to connect to the Discord API
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent]
});

// Prapare to connect to the OpenAi API

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    orgainzation: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_KEY
});

const openai = new OpenAIApi(configuration);

// Check for a message from a user on Discord
client.on('messageCreate', async function (message) {
    try {
        if (message.author.bot) return;
        const messages = await message.channel.messages.fetch({ limit: 10 });
        const history = messages
            .filter(m => m.author.id === message.author.id)
            .map(m => m.content)
            .reverse();
        const gptResponse = await openai.createCompletion({
            model: 'text-davinci-003',
            // this prompt will ensure that the bot has context for the conversation
            prompt: `ChatGPT is Jordan Peterson.\n\
            Replies should made as Jordan Peterson.\n\
            ChatGPT: Hello, how are you?\n\
            ${history.join('\n')}\n\
            ${message.author.username}: ${message.content}.\n\
            ChatGPT:`,
            max_tokens: 100,
            temperature: 0.9,
            stop: ['\n', ' Human:', ' AI:'],
        })
        message.reply(`${gptResponse.data.choices[0].text}`);
        return;
    }
    catch (error) {
        console.log(error);
    }
});

//Login to Discord
client.login(process.env.DISCORD_TOKEN);
console.log('Bot is running');
