const Discord = require('discord.js');
const {logs} = require('./logs.js');
const {cmdRegistry} = require('./command.js');
const fs = require('fs');

const bot = new Discord.Client();
bot.on('ready', () => {
  logs.info('Logged in');
});
bot.on('message', async msg => {
  if (!msg.channel.permissionsFor || msg.channel.permissionsFor(bot.user).has('SEND_MESSAGES')) {
    if (!!msg.content && msg.content.startsWith('$/')) {
      logs.info(`${msg.author.tag}: ${msg.content}`);
      const result = await cmdRegistry.executeFormatted(msg, bot, msg.content.substring(2));
      if (!!result) {
        if (typeof result === 'string') {
          msg.channel.send(result);
        } else if (result instanceof Discord.RichEmbed) { // this can't ever happen?
          msg.channel.send('', {embed: result});
        } else {
          msg.channel.send(result.msg, {embed: result.embed});
        }
      }
    }
  }
});

(async () => {
  const files = await fs.readdirSync(__dirname + '/command');
  for (const file of files) {
    if (file.endsWith('.js')) cmdRegistry.register(require('./command/' + file));
  }
  bot.login(process.env.DS_TOKEN).catch(logs.error);
})();
