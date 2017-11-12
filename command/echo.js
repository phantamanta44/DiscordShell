const {Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'echo',
  description: 'Echo the STRING(s) to standard output.',
});
ap.addArgument('STRING', {help: 'The strings to be printed.', nargs: '*'});
module.exports = new Command('echo', 'say', 'print').withArgs(ap)
  .withExec((args, msg, bot, stdin) => args['STRING'].join(' '));
