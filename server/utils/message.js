const moment = require('moment');

var generateMessage = (from, text, id) => {
  return {
    from: from,
    text: text,
    createdAt: moment().valueOf(),
    url: false,
    mId: id
  };
};

module.exports = {generateMessage};
