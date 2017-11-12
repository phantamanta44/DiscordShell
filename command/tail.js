const {Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'tail',
  description: 'Output the last part of STDIN.',
});
ap.addArgument(['-n', '--lines'], {
  help: 'The number of lines to print.', action: 'store', defaultValue: 10, type: 'int', dest: 'n',
});
module.exports = new Command('tail').withArgs(ap)
  .withExec((args, msg, bot, stdin) => stdin.slice(stdin.length - args['n']));
