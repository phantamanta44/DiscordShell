const Discord = require('discord.js');
const {logs} = require('./logs.js');
const {cmdRegistry} = require('./command.js');
const fs = require('fs');

const bot = new Discord.Client();
let cmdPattern;
bot.on('ready', () => {
  logs.info('Logged in');
  cmdPattern = new RegExp(`^\\s*<@!?${bot.user.id}>\s*(.+)`, 'g');
});
bot.on('message', async msg => {
  if (!msg.author.bot && !!msg.content) {
    let result;
    if (!msg.channel.guild) {
      logs.info(`M/ ${msg.author.tag}: ${msg.content}`);
      result = await cmdRegistry.executeFormatted(msg, bot, msg.content);
    } else if (msg.channel.permissionsFor(bot.user).has('SEND_MESSAGES')) {
      let match = cmdPattern.exec(msg.content);
      if (!!match) {
        logs.info(`G/ ${msg.author.tag}: ${msg.content}`);
        result = await cmdRegistry.executeFormatted(msg, bot, match[1]);
      }
    }
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
});

(async () => {
  const files = await fs.readdirSync(__dirname + '/command');
  for (const file of files) {
    if (file.endsWith('.js')) cmdRegistry.register(require('./command/' + file));
  }
  bot.login(process.env.DS_TOKEN).catch(logs.error);
})();
