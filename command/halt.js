const {Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'halt',
  description: 'Reboot or stop the bot.',
});
ap.addArgument(['-h', '--halt'], {
  help: 'Shut down the bot.', action: 'storeConst', dest: 'a', constant: {
    code: 0, msg: 'Shutting down!',
  },
});
ap.addArgument(['-r', '--reboot'], {
  help: 'Reboot the bot.', action: 'storeConst', dest: 'a', constant: {
    code: 15, msg: 'Rebooting!',
  },
});
ap.addArgument(['-R', '--update-reboot'], {
  help: 'Reboot and update the bot.', action: 'storeConst', dest: 'a', constant: {
    code: 16, msg: 'Rebooting for update!',
  },
});
module.exports = new Command('halt').withArgs(ap)
  .withExec(async (args, msg, bot, stdin) => {
    if (!args.superuserMode) throw new Error('No permission!');
    const action = args['a'];
    if (!action) throw new Error('No action specified!');
    await msg.reply(action.msg);
    await bot.destroy();
    process.exit(action.code);
  });
