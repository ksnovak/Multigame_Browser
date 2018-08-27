import chalk from 'chalk';


module.exports = {
  devLog(message) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(message);
    }
  },

  devChalk(color, message) {
    if (message === undefined)
      return chalk.keyword(color)
    else
      return chalk.keyword(color)(message);
  }
};
