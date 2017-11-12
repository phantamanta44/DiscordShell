require('argparse/lib/action/help.js').prototype.call = function(parser, ns) {
  throw new HelpCalled();
};
require('argparse').ArgumentParser.prototype.error = function(err) {
  throw err instanceof Error ? err : new Error(err);
};

class HelpCalled extends Error {}

const c_ident = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
const c_capt = new Map();
c_capt.set('\'', {type: 'inter', delim: '\''});
c_capt.set('"', {type: 'str', delim: '"'});
c_capt.set('`', {type: 'inter', delim: '`'});

class Tokenizer {
  constructor(str) {
    this.str = str.trim();
    this.finished = false;
    this.commands = [];
    this.tokens = [];
    this.current = '';
  }

  tokenize() {
    if (this.finished) return this.commands;
    let command = true;
    let capture = null;
    let escape = false;
    let finishedCapture = false;
    let inSpace = true;
    for (let i = 0; i < this.str.length; i++) {
      const char = this.str[i];
      if (finishedCapture) {
        if (char === '|') {
          this.advanceCommand();
          command = inSpace = true;
        } else if (char !== ' ') {
          throw new Error(`(at ${i}) expected space or pipe, got ${char}`);
        }
        inSpace = true;
        finishedCapture = false;
      } else if (command) {
        if (char === ' ') {
          if (!inSpace) {
            this.token('cmd');
            command = false;
            inSpace = true;
          }
        } else if (char === '|') {
          this.token('cmd');
          this.advanceCommand();
          command = inSpace = true;
        } else if (c_ident.includes(char)) {
          this.append(char);
          inSpace = false;
        } else {
          throw new Error(`(at ${i}) expected command identifier, got ${char}`);
        }
      } else if (capture) {
        if (escape) {
          this.append(char);
          escape = false;
        } else if (char === capture.delim) {
          this.token(capture.type);
          finishedCapture = true;
          capture = null;
        } else if (char === '\\') {
          escape = true;
        } else {
          this.append(char);
        }
      } else if (escape) {
        this.append(char);
        escape = false;
      } else if (char === '\\') {
        escape = true;
        inSpace = false;
      } else if (char === ' ') {
        if (!inSpace) this.token('str');
        inSpace = true;
      } else if (char === '|') {
        if (!inSpace) this.token('str');
        this.advanceCommand();
        command = inSpace = true;
      } else if (capture = c_capt.get(char)) {
        inSpace = false;
      } else {
        this.append(char);
        inSpace = false;
      }
    }
    if (command) {
      if (inSpace) throw new Error('(at end) expected command identifier');
      this.token('cmd');
    } else if (!inSpace) {
      if (capture) {
        throw new Error(`(at end) expected ${capture.delim}`);
      } else {
        this.token('str');
      }
    }
    this.advanceCommand();
    this.finished = true;
    return this.commands;
  }

  advanceCommand() {
    this.commands.push(this.tokens);
    this.tokens = [];
  }

  append(c) {
    this.current += c;
  }

  token(type) {
    this.tokens.push({
      type: type,
      value: this.current,
    });
    this.current = '';
  }
}

class CommandRegistry {
  constructor() {
    this.commands = [];
    this.aliases = new Map();
  }

  async executeFormatted(msg, bot, str) {
    try {
      let result = (await this.execute(msg, bot, str)).join('\n');
      if (result.length > 1000) result = result.substring(0, 1000) + `\n(${result.length - 1000} more characters...)`;
      return `\`\`\`\n${result}\n\`\`\``;
    } catch (e) {
      return `${msg.author.toString()}: ${e.message}`;
    }
  }

  async execute(msg, bot, str) {
    let commands;
    try {
      commands = new Tokenizer(str).tokenize();
    } catch (e) {
      throw new Error(`Errored while parsing:\n\`${e.message}\``);
    }
    return await this.executeTokens(msg, bot, commands);
  }

  async executeTokens(msg, bot, commands) {
    for (let i = 0; i < commands.length; i++) {
      const name = commands[i][0].value;
      const command = this.resolve(name);
      if (!command) throw new Error(`No such command \`${name}\``);
      commands[i] = {
        cmd: command,
        args: commands[i].slice(1).map(t => t.value), // TODO do something with interpolated-string tokens
      };
    }
    return await this.executeCommands(msg, bot, commands);
  }

  async executeCommands(msg, bot, commands) {
    let stream = [];
    for (const command of commands) {
      try {
        stream = await command.cmd.invoke(command.args, msg, bot, stream);
        if (typeof stream === 'string') stream = [stream];
      } catch (e) {
        throw new Error(`Errored on invocation:\n\`${e.message}\``);
      }
    }
    return stream;
  }

  register(cmd) {
    this.aliases.set(cmd.name, this.commands.length);
    for (const alias of cmd.aliases) this.aliases.set(alias, this.commands.length);
    this.commands.push(cmd);
  }

  resolve(name) {
    return this.commands[this.aliases.get(name)] || null;
  }
}

class Command {
  constructor(name, ...aliases) {
    this.name = name;
    this.aliases = aliases;
    this.args = null;
    this.exec = null;
  }

  withArgs(args) {
    this.args = args;
    return this;
  }

  withExec(exec) {
    this.exec = exec;
    return this;
  }

  async invoke(args, msg, bot, stdin, su = false) {
    try {
      const parsed = this.args.parseArgs(args);
      parsed.superuserMode = su;
      return await this.exec(parsed, msg, bot, stdin);
    } catch (e) {
      if (e instanceof HelpCalled) return this.args.formatHelp();
      throw new Error(`${this.name}: ${e.message}`);
    }
  }
}

module.exports = {
  cmdRegistry: new CommandRegistry(),
  Tokenizer: Tokenizer,
  Command: Command,
};
