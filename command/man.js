const {cmdRegistry, Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'man',
  description: 'Formats and displays information on a command.',
});
ap.addArgument('COMMAND', {help: 'The command to look up.'});
module.exports = new Command('man').withArgs(ap)
  .withExec((args, msg, bot, stdin) => {
    const command = cmdRegistry.resolve(args['COMMAND']);
    return !command ? `No manual entry for ${args['COMMAND']}` : command.args.formatHelp().split('\n');
  });
