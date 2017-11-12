const {Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'invite',
  description: 'Produces an invite link.',
});
module.exports = new Command('invite').withArgs(ap)
  .withExec(async (args, msg, bot, stdin) => await bot.generateInvite());
