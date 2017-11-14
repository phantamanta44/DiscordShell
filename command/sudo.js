const {cmdRegistry, Command} = require('../command.js');
const {ArgumentParser} = require('argparse');
const fs = require('fs');

const sudoers = fs.readFileSync('sudoers.json', {encoding: 'utf-8'}).split('\n');

const ap = new ArgumentParser({
  prog: 'sudo',
  description: 'Execute COMMAND with full privileges.',
  prefixChars: [],
});
ap.addArgument('COMMAND', {help: 'The command to run.'});
ap.addArgument('ARG', {help: 'The arguments to COMMAND.', nargs: '*'});
module.exports = new Command('sudo').withArgs(ap)
  .withExec(async (args, msg, bot, stdin) => {
    if (sudoers.includes(msg.author.id)) {
      const command = cmdRegistry.resolve(args['COMMAND']);
      if (!command) throw new Error(`No such command \`${args['COMMAND']}\``);
      const result = command.invoke(args['ARG'], msg, bot, stdin, true);
      return typeof result === 'string' ? [result] : result;
    } else {
      return `${msg.author.username} is not in the sudoers file.\nThis incident will be reported.`;
    }
  });
