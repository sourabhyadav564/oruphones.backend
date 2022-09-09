const eventModal = require("../database/modals/others/event_logs");
const moment = require("moment");
const dotenv = require("dotenv");
const createUserModal = require("../database/modals/login/login_create_user");
dotenv.config();

const validUser = async (req, res, next) => {
  const userUniqueId = req.headers.useruniqueid;
  const events = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;
  const location = req.headers.location;
  const devicePlatform = req.headers.devicePlatform;

  try {
    if (process.env.EVENT === "Active" && userUniqueId != "Guest") {
      const getUser = await createUserModal.findOne({
        userUniqueId: userUniqueId,
      });
      if (getUser) {
        next();
      } else {
        res.status(200).send({
          status: "INVALID_USER",
          statusCode: 200,
          reason: "User not found",
        });
      }
      return;
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = validUser;
