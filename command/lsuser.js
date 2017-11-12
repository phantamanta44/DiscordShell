const {Command} = require('../command.js');
const {ArgumentParser} = require('argparse');

const ap = new ArgumentParser({
  prog: 'lsuser',
  description: 'Lists users in this guild, displaying IDs by default.',
});
ap.addArgument('-i', {help: 'Display IDs.', action: 'storeConst', constant: u => u.id, dest: 'fmt'});
ap.addArgument('-u', {help: 'Display usernames.', action: 'storeConst', constant: u => u.user.username, dest: 'fmt'});
ap.addArgument('-U', {help: 'Display username#discrim strings.', action: 'storeConst', constant: u => u.user.tag, dest: 'fmt'});
ap.addArgument('-n', {help: 'Display nicknames.', action: 'storeConst', constant: u => u.displayName, dest: 'fmt'});
module.exports = new Command('lsuser', 'users').withArgs(ap)
  .withExec((args, msg, bot, stdin) => {
    if (!msg.channel.guild) throw new Error('Not in a guild!');
    return msg.channel.guild.members.array().map(args['fmt'] || (u => u.id));
  });
