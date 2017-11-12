const {cmdRegistry, Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'help',
  description: 'Show basic information concerning bot operation.',
  addHelp: false,
});
module.exports = new Command('help', 'info').withArgs(ap)
  .withExec((args, msg, bot, stdin) => [
    'Hi, I\'m DiscordShell by Phanta#1328!',
    'I run commands with a shell-like syntax!',
    'For example, this counts users with an "e" in their name:',
    '', '  lsuser -n | grep -i e | wc -l', '',
    'Here\'s an index of my currently registered commands:',
    '', '  ' + cmdRegistry.commands.map(c => c.name).sort().join(', '), '',
    'You can get info on any command using man. Have fun!',
  ]);
