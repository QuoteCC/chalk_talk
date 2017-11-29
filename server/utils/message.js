const moment = require('moment');

var generateMessage = (from, text) => {
  return {
    from: from,
    text: text,
    createdAt: moment().valueOf(),
    url: false
  };
};

module.exports = {generateMessage};
