const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const createUserModal = require("../../src/database/modals/login/login_create_user");

router.get("/user/details", async (req, res) => {
  const mobileNumber = req.query.mobileNumber;
  const countryCode = req.query.countryCode;

  try {
    const getUser = await createUserModal.findOne({ mobileNumber });

    if (getUser) {
      res.status(200).json({
        reason: "User found successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          userUniqueId: getUser.userUniqueId,
          userdetails: getUser,
        },
      });
    } else {
      res.status(404).json({
        reason: "User not found",
        statusCode: 404,
        status: "FAILURE",
      });
    }

  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/user/create", async (req, res) => {
  const email = req.body.email;
  const mobileNumber = parseInt(req.body.mobileNumber);
  const profilePicPath = req.body.profilePicPath;
  const countryCode = req.body.countryCode;
  const userName = req.body.userName;
  const userType = req.body.userType;
  const userUniqueId = req.body.userUniqueId;

  const createUserData = {
    email: email,
    mobileNumber: mobileNumber,
    profilePicPath: profilePicPath,
    countryCode: countryCode,
    userName: userName,
    userType: userType,
    userUniqueId,
  };

  try {
    const getUser = await createUserModal.findOne({ mobileNumber });

    if (getUser) {
      res.status(200).json({
        reason: "User Already Available",
        statusCode: 1,
        status: "SUCCESS",
        dataObject: {
          userUniqueId: getUser.userUniqueId,
          userdetails: getUser,
        },
      });
      return;
    } else {
      const data = new createUserModal(createUserData);
      const saveData = await data.save();
      res.status(201).json({
        reason: "UserCreated Successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          userUniqueId: saveData._id,
          userdetails: saveData,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/user/update", async (req, res) => {
  const city = req.body.city;
  const email = req.body.email;
  const mobileNumber = req.body.mobileNumber;
  const profilePicPath = req.body.profilePicPath;
  const countryCode = req.body.countryCode;
  const userName = req.body.userName;
  const userUniqueId = {
    userUniqueId: req.body.userUniqueId,
  }

  const createUserData = {
    email: email,
    profilePicPath: profilePicPath,
    userName: userName,
    city: city,
  };

  try {
    const updateUser = await createUserModal.findOneAndUpdate(
      userUniqueId,
      createUserData,
      {
        new: true,
      }
    );

    console.log("updateUser", updateUser);

    if (!updateUser) {
      res.status(404).json({
        reason: "User not found",
        statusCode: 404,
        status: "FAILURE",
      });
      return;
    } else {
      res.status(200).json({
        reason: "User profile updated successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          userUniqueId: updateUser.userUniqueId,
          userdetails: updateUser,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
