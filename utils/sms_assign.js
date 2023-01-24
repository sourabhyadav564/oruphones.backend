const express = require("express");
const shortLinkModal = require("../src/database/modals/others/short_link_model");
// const saveListingModal = require("../src/database/modals/device/save_listing_device");
// const createUserModal = require("../src/database/modals/login/login_create_user");
const SendSMSByTxtLocal = require("./send_sms_textlcl");
require("dotenv").config();
const BitlyClient = require("bitly").BitlyClient;
const bitly = new BitlyClient("b798af6695d4e81885f3fd925aa2e152c16123ea");

async function urlShortner(url) {
  const response = await bitly.shorten(url);
  return response.link;
}

let allUniqueKeys = [];

async function getUniqueKey() {
  if (allUniqueKeys.length == 0) {
    const allKeys = await shortLinkModal.find();
    await allKeys.forEach((key) => {
      allUniqueKeys.push(key.unKey);
    });
  }

  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (allUniqueKeys.includes(result)) {
    result = await getUniqueKey();
  } else {
    allUniqueKeys.push(result);
  }
  return result.toString();
}

const uploadUrlInDb = async (url) => {
  let unKey = await getUniqueKey();
  const data = new shortLinkModal({
    unKey,
    linkStr: url,
  });
  const saveData = await data.save();
  return "opcs.io/" + data.unKey.toString();
};

const sendingSms = async (type, phone, uuid, userName, model) => {
  // let shortLink = await urlShortner(
  //   process.env.SERVER_URL + `/showListings?routeto=${uuid}`
  // );

  let shortLink = await uploadUrlInDb(
    process.env.SERVER_URL + `/showListings?routeto=${uuid}`
  );

  // let shortLink = process.env.SERVER_URL + `/showListings?routeto=${uuid}`;

  let msg = "";

  // model max length 20
  if (model.length > 18) {
    model = model.substring(0, 18) + "...";
  }

  // get only first name of userName if space is there
  if (userName.includes(" ")) {
    userName = userName.split(" ")[0];
  }

  if (type == "weekly") {
    // msg = `Dear User, you have some unverified listings at ORUphones. Please verify your listings for quick selling. Here's your listing link ${shortLink} to complete the verification process. Team ORUphones.`;
    msg = `Dear User, you have unverified listings at ORUphones. Verify your listings for quick selling. To verify, click ${shortLink}`;
  } else if (type == "daily") {
    // msg = `Hey ${userName}, You recently created an ad to sell your ${model} on an online marketplace. We at ORUphones have listed your phone for FREE. You can view or modify your listing here: ${shortLink}`;
    msg = `Hey ${userName}, you created an ad to sell your ${model} . We at ORUphones listed your phone for FREE. To view your listing click ${shortLink} . Team ORUphones.`;
  } else if (type == "verify") {
    // msg = `Hey ${userName}, Someone wants to buy your ${model}and requested verification. Please verify your device. Here's your listing link ${shortLink} to complete the verification process. Team ORUphones.`;
    msg = `Hey ${userName}, You recently created an ad to sell your ${model}on an online marketplace. We at ORUphones have listed your phone for FREE. Please verify your listing once to sell quickly. Do follow the link for the verification process: ${shortLink}`;
  } else {
    // return without sending sms
    return;
  }

  SendSMSByTxtLocal(phone, msg);
};

module.exports = sendingSms;
