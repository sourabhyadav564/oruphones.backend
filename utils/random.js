const eventModal = require("../src/database/modals/others/event_logs");

function randomString(length, chars) {
    var result = "";
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
  
  let rString = randomString(
    12,
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );

const validatedSessionId = async () => {
    const document = await eventModal.findOne({ sessionId: rString });
    if(document){
      var newRandomString = randomString(
        12,
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
      );
      rString = newRandomString;
      validatedSessionId();
    } else {
      return rString;
    }
}


  module.exports = randomString 