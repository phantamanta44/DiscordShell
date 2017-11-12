const {Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'widen',
  description: 'Increases the aesthetic of STRING(s). An empty input signals input from STDIN.',
});
ap.addArgument(['-n', '--spaces'], {
  help: 'The magnitude of the aestheti-fication.', action: 'store', defaultValue: 1, type: 'int', dest: 'n',
});
ap.addArgument(['-u', '--uppercase'], {
  help: 'Uppercases the aesthetic strings.', action: 'storeConst', dest: 'fmt',
  constant: s => s.toUpperCase(), defaultValue: s => s.toLowerCase(),
});
ap.addArgument('STRING', {help: 'The strings to be aestheti-fied.', nargs: '*'});
module.exports = new Command('widen', 'aesthetic', 'vapor').withArgs(ap)
  .withExec((args, msg, bot, stdin) => {
    const spaces = ' '.repeat(args['n']);
    let input = args['STRING'].join(' ');
    input = !input.trim() ? stdin : [input];
    return input.map(s => args['fmt'](s.replace(/\s/g, '')).split('').join(spaces));
  });
