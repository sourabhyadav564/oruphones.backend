const textlocal = require("textlocal-complete");

const SendingSmsFunction = async (phone, msg) => {
  const textlocalAPI = "NDczMjY0NTI2ZTQ1MzA3NjQ0MzgzODc2NGEzNDZkNzM=";
  const textlocalNumbers = phone;
  const textlocalSender = "ORUPHN";
  const textlocalMessage = msg;
    // `Dear User, you have some unverified listings at ORUphones. Please verify your listings for quick selling. Here's your listing link ${link} to complete the verification process. Team ORUphones.`;

  textlocal
    .sendSms(textlocalAPI, textlocalNumbers, textlocalSender, textlocalMessage)
    .then((response) => {
      // console.log(response);
    });
};

const SendSMSByTxtLocal = async (phone, msg) => {
  SendingSmsFunction(phone, msg);
};

module.exports = SendSMSByTxtLocal;
