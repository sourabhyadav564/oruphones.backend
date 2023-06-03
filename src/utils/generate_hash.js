var bcrypt = require("bcryptjs");

const generateHash = async (string) => {
  var salt = bcrypt.genSaltSync(10);
  var finalHash = bcrypt.hashSync(string, salt);
  return finalHash;
};

module.exports = generateHash;
