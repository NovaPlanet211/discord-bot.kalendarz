require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot zalogowany jako ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.content === '!ping') {
    message.channel.send('🏓 Pong!');
  }
});

const { getUpcomingEvents } = require('./calendar');

async function sendReminders() {
  const events = await getUpcomingEvents();
  const channel = client.channels.cache.get('ID_KANAŁU');

  events.forEach(event => {
    const time = event.start.dateTime || event.start.date;
    channel.send(`📅 Nadchodzące wydarzenie: **${event.summary}** o ${time}`);
  });
}

// Co 30 minut
setInterval(sendReminders, 30 * 60 * 1000);
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'lista',
    description: 'Wyświetl nadchodzące wydarzenia z kalendarza'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands('ID_BOTA'),
    { body: commands }
  );
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'lista') {
    const events = await getUpcomingEvents();
    const msg = events.map(e => `📅 ${e.summary} – ${e.start.dateTime || e.start.date}`).join('\n');
    await interaction.reply(msg || 'Brak nadchodzących wydarzeń.');
  }
});


client.login(process.env.DISCORD_TOKEN);
