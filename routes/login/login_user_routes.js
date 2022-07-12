const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const logEvent = require("../../src/middleware/event_logging");
const moment = require("moment");

router.get("/user/details", logEvent, async (req, res) => {
  const mobileNumber = parseInt(req.query.mobileNumber);
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

router.post("/user/create", logEvent, async (req, res) => {
  const now = new Date();
  const currentDate = moment(now).format("L");

  const email = req.body.email;
  const mobileNumber = req.body.mobileNumber
    ? parseInt(req.body.mobileNumber)
    : req.body.mobileNumber;
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
    createdDate: currentDate,
  };

  try {
    const getUser = await createUserModal.findOne({ mobileNumber });

    if (getUser) {
      res.status(200).json({
        reason: "User Already Available",
        statusCode: 1,
        status: "FAIL",
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
        reason: "User Created Successfully",
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

router.post("/user/update", logEvent, async (req, res) => {
  const city = req.body.city;
  const email = req.body.email;
  const mobileNumber = req.body.mobileNumber;
  const profilePicPath = req.body.profilePicPath;
  const countryCode = req.body.countryCode;
  const userName = req.body.userName;
  const userUniqueId = {
    userUniqueId: req.body.userUniqueId,
  };

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

router.post("/address/addSearchLocation", async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const city = req.body.city;
  const locationId = req.body.locationId;

  try {
    if (userUniqueId === "Guest") {
      res.status(200).json({
        reason: "Profile location added successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          addressType: "SearchLocation",
          city: city,
          locationId: locationId,
        },
      });
      return;
    } else {
      const getUser = await createUserModal.findOne({ userUniqueId });

      if (getUser) {
        const userAddress = getUser.address;
        let bool = false;
        let dataToBeSend = {};

        userAddress.forEach(async (element, i) => {
          if (element.addressType == "SearchLocation") {
            userAddress[i].city = city;
            userAddress[i].locationId = locationId;
            bool = true;
            dataToBeSend = userAddress[i];
          }
        });
        if (!bool && locationId == "-1") {
          dataToBeSend = {
            addressType: "SearchLocation",
            city: city,
            locationId: locationId,
          };
          userAddress.push(dataToBeSend);
        }

        console.log("userAddress", userAddress);
        const dataObject = {
          address: userAddress,
        };
        await createUserModal.findByIdAndUpdate(getUser._id, dataObject, {
          new: true,
        });
        res.status(200).json({
          reason: "Profile location added successfully",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: dataToBeSend,
        });
      } else {
        res.status(200).json({
          reason: "User not found",
          statusCode: 200,
          status: "SUCCESS",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/address/addProfileLocation", logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const city = req.body.city;

  try {
    const getUser = await createUserModal.findOne({ userUniqueId });
    if (getUser) {
      const userAddress = getUser.address;
      let bool = false;
      let dataToBeSend = {};

      userAddress.forEach(async (element, i) => {
        if (element.addressType == "ProfileLocation") {
          userAddress[i].city = city;
          bool = true;
          dataToBeSend = userAddress[i];
        }
      });
      if (!bool) {
        dataToBeSend = {
          addressType: "ProfileLocation",
          city: city,
        };
        userAddress.push(dataToBeSend);
      }
      const dataObject = {
        address: userAddress,
      };
      await createUserModal.findByIdAndUpdate(getUser._id, dataObject, {
        new: true,
      });
      res.status(200).json({
        reason: "Profile location added successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: dataToBeSend,
      });

      // const dataObject = {
      //   address: userAddress,
      // }
      // const dataObject = {
      //   address: [
      //     {
      //       addressType: "ProfileLocation",
      //       city: city,
      //       // locationId: getUser._id,
      //     },
      //   ],
      // };

      // if (locationId == -1) {
      // await createUserModal.findByIdAndUpdate(getUser._id, dataObject, {
      //   new: true,
      // });
      // res.status(200).json({
      //   reason: "Profile location added successfully",
      //   statusCode: 200,
      //   status: "SUCCESS",
      //   dataObject,
      // });
      // } else {
      //   await createUserModal.findByIdAndUpdate(getUser._id, dataObject, {
      //     new: true,
      //   });
      //   res.status(200).json({
      //     reason: "location found and updated successfully",
      //     statusCode: 200,
      //     status: "SUCCESS",
      //     dataObject,
      //   });
      // }
    } else {
      res.status(200).json({
        reason: "User not found",
        statusCode: 200,
        status: "SUCCESS",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
