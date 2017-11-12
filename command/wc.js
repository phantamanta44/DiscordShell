const {Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const countLines = stdin => stdin.length;
const countWords = stdin => stdin.map(s => s.trim().split(' ').length).reduce((a, b) => a + b);
const countDefault = stdin => `${countLines(stdin)} ${countWords(stdin)}`;

const ap = new ArgumentParser({
  prog: 'wc',
  description: 'Print newline and word count from STDIN.',
});
ap.addArgument(['-m', '--chars'], {
  help: 'Print the character count.', action: 'storeConst', dest: 'map',
  constant: stdin => stdin.map(s => s.length).reduce((a, b) => a + b),
});
ap.addArgument(['-l', '--lines'], {
  help: 'Print the newline count.', action: 'storeConst', dest: 'map',
  constant: countLines,
});
ap.addArgument(['-L', '--max-line-length'], {
  help: 'Print the length of the longest line.', action: 'storeConst', dest: 'map',
  constant: stdin => Math.max(...stdin.map(s => s.length)),
});
ap.addArgument(['-M', '--min-line-length'], {
  help: 'Print the length of the shortest line.', action: 'storeConst', dest: 'map',
  constant: stdin => Math.min(...stdin.map(s => s.length)),
});
ap.addArgument(['-w', '--words'], {
  help: 'Print the word count.', action: 'storeConst', dest: 'map',
  constant: countWords,
});
module.exports = new Command('wc', 'wordcount').withArgs(ap)
  .withExec((args, msg, bot, stdin) => (args['map'] || countDefault)(stdin).toString());
