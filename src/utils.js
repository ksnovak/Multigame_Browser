import chalk from 'chalk';

const env = process.env.NODE_ENV || 'dev';

module.exports = {
  devLog(message) {
    if (env === 'dev') {
      console.log(message);
    }
  }
};
