const {cmdRegistry, Command} = require('../command.js');
const {ArgumentParser} = require('argparse');
const fs = require('fs');

const sudoers = fs.readFileSync('sudoers.json', {encoding: 'utf-8'}).split('\n');

const ap = new ArgumentParser({
  prog: 'sudo',
  description: 'Execute COMMAND with full privileges.',
  prefixChars: [],
  addHelp: false,
});
ap.addArgument('COMMAND', {help: 'The command to run.'});
ap.addArgument('ARG', {help: 'The arguments to COMMAND.', nargs: '*'});
module.exports = new Command('sudo').withArgs(ap)
  .withExec(async (args, msg, bot, stdin) => {
    const name = args['COMMAND'];
    if (/^-h|--help$/.test(name)) {
      return ap.formatHelp();
    } else if (sudoers.includes(msg.author.id)) {
      const command = cmdRegistry.resolve(name);
      if (!command) throw new Error(`No such command \`${name}\``);
      const result = command.invoke(args['ARG'], msg, bot, stdin, true);
      return typeof result === 'string' ? [result] : result;
    } else {
      return `${msg.author.username} is not in the sudoers file.\nThis incident will be reported.`;
    }
  });
