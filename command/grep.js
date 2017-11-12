const {Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'grep',
  description: 'Searches STDIN for lines containing a match to a given PATTERN.',
});
ap.addArgument(['-E', '--extended-regexp'], {
  help: 'Interpret PATTERN as a regular expression.', action: 'storeConst', dest: 'funcs',
  constant: {
    factory: (s, i, x) => new RegExp(x ? ('^' + s + '$') : s, 'g' + i ? 'i' : ''),
    map: (s, i, f, x) => {
      const m = f.exec(s);
      if (!m) return null;
      m.line = s;
      return m;
    },
    filter: r => r !== null,
    extract: r => r[0],
  },
});
ap.addArgument(['-i', '--ignore-case'], {help: 'Ignore case distinctions.', action: 'storeTrue', dest: 'case'});
ap.addArgument(['-v', '--invert-match'], {help: 'Search for non-matching lines.', action: 'storeTrue', dest: 'inv'});
ap.addArgument(['-x', '--line-regexp'], {help: 'Search for whole-line matches.', action: 'storeTrue', dest: 'x'});
ap.addArgument(['-c', '--count'], {help: 'Print a count of matching lines.', action: 'storeTrue', dest: 'cnt'});
ap.addArgument(['-o', '--only-matching'], {help: 'Print only the matched part of lines.', action: 'storeTrue', dest: 'o'});
ap.addArgument('PATTERN', {help: 'The pattern to search for.', nargs: '*'});
module.exports = new Command('grep').withArgs(ap)
  .withExec((args, msg, bot, stdin) => {
    const funcs = args['funcs'] || {
      factory: (s, i, x) => s,
      map: (s, i, f, x) => {
        let a = s;
        if (i) {
          a = s.toLowerCase();
          f = f.toLowerCase();
        }
        return x
          ? {match: a === f, line: s, part: s}
          : {match: (a = a.indexOf(f)) !== -1, line: s, part: s.substring(a, a + f.length)};
      },
      filter: r => r.match,
      extract: r => r.part,
    };
    const pattern = funcs.factory(args['PATTERN'].join(' '), args['case'], args['x']);
    const inv = args['inv'];
    const matching = stdin
      .map(s => funcs.map(s, args['case'], pattern, args['x']))
      .filter(r => funcs.filter(r) ^ inv);
    if (args['cnt']) return matching.length.toString();
    if (args['o']) return matching.map(r => funcs.extract(r));
    return matching.map(r => r.line);
  });
