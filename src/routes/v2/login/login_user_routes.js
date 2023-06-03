const express = require('express')
const router = express.Router()

const createUserModal = require('../../../database/modals/login/login_create_user')
const logEvent = require('../../../middleware/log_event');
const moment = require('moment')
const notificationModel = require('../../../database/modals/notification/complete_notifications')
const favoriteModal = require('../../../database/modals/favorite/favorite_add')
const saveRequestModal = require('../../../database/modals/device/request_verification_save')
const saveNotificationModel = require('../../../database/modals/notification/notification_save_token')
const saveListingModal = require('../../../database/modals/device/save_listing_device')
const validUser = require('../../../middleware/valid_user')
const is_Session = require('../../../middleware/is_Session')


router.get('/user/details',is_Session,logEvent, async (req, res) => {
  const sessionId = req.sessionID; // Retrieve the session ID from the cookie
  const User = req.session.User; // Retrieve the user ID from the session

  if(sessionId && User) {

    try {
    
      const getUser = await createUserModal.findOne({
        mobileNumber: User.mobileNumber,
      })
  
      if (getUser) {
        res.status(200).json({
          reason: 'User found successfully',
          statusCode: 200,
          status: 'SUCCESS',
          dataObject: {
            userUniqueId: getUser.userUniqueId,
            userdetails: getUser,
          },
        })
      } else {
        res.status(404).json({
          reason: 'User not found',
          statusCode: 404,
          status: 'FAILURE',
        })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json(error)
    }
  }
  else {
    res.status(401).send("Cookie Not Found")
  }
})

router.post('/user/create', is_Session,logEvent, async (req, res) => {
  const now = new Date()
  const currentDate = moment(now).format('L')

  const email = req.body.email
  const mobileNumber = req.body.mobileNumber
    ? parseInt(req.body.mobileNumber)
    : req.body.mobileNumber
  const profilePicPath = req.body.profilePicPath
  const countryCode = req.body.countryCode
  const userName = req.body.userName
  const userType = req.body.userType
  const userUniqueId = req.body.userUniqueId

  const createUserData = {
    email: email,
    mobileNumber: mobileNumber,
    profilePicPath: profilePicPath,
    countryCode: countryCode,
    userName: userName,
    userType: userType,
    userUniqueId,
    createdDate: currentDate,
  }

  try {
    const getUser = await createUserModal.findOne({ mobileNumber })

    if (getUser) {
      res.status(200).json({
        reason: 'User Already Available',
        statusCode: 200,
        status: 'FAIL',
        dataObject: {
          userUniqueId: getUser.userUniqueId,
          userdetails: getUser,
        },
      })
      return
    } else {
      const data = new createUserModal(createUserData)
      const saveData = await data.save()
      res.status(201).json({
        reason: 'User Created Successfully',
        statusCode: 200,
        status: 'SUCCESS',
        dataObject: {
          userUniqueId: saveData._id,
          userdetails: saveData,
        },
      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})
router.post('/user/update',is_Session,logEvent, async (req, res) => {
  const sessionId = req.sessionID; // Retrieve the session ID from the cookie
  const User = req.session.User; // Retrieve the user ID from the session

  if(sessionId && User) {
    const city = req.body.city
    const email = req.body.email
    const mobileNumber = User.mobileNumber
    const profilePicPath = req.body.profilePicPath
    const countryCode = req.body.countryCode
    const userName = req.body.userName
    const userUniqueId = User.userUniqueId

    const updateData = {
      email: email,
      profilePicPath: profilePicPath,
      userName: userName,
      city: city,
    }

    try {
      const updateUser = await createUserModal.findOneAndUpdate(
        { mobileNumber: mobileNumber }, // Filter object
        updateData, // Update object
        { new: true } // Options: return the updated document
      )

      if (!updateUser) {
        res.status(404).json({
          reason: 'User not found',
          statusCode: 404,
          status: 'FAILURE',
        })
        return
      } else {
        res.status(200).json({
          reason: 'User profile updated successfully',
          statusCode: 200,
          status: 'SUCCESS',
          dataObject: {
            userUniqueId: updateUser.userUniqueId,
            userdetails: updateUser,
          },
        })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json(error)
    }
  } else {
    res.status(400).json({
      reason: 'Invalid session ID',
      statusCode: 400,
      status: 'FAILURE',
    })
  }
})


router.post('/user/delete', is_Session, logEvent, async (req, res) => {
  const User = req.session.User; // Retrieve the user ID from the session
  const userUniqueId = User.userUniqueId

  let deleteUserAccount
  let deleteUserNotification
  let deleteUserFavorite
  let deleteUserRequestVerification
  let delelteUserNotificationToken
  let deleteUserListings
  try {
    const userNotification = await notificationModel.find({
      userUniqueId: userUniqueId,
    })
    if (userNotification) {
      deleteUserNotification = await notificationModel.findOneAndDelete({
        userUniqueId: userUniqueId,
      })
    }
    const userFavorite = await favoriteModal.find({
      userUniqueId: userUniqueId,
    })
    if (userFavorite) {
      deleteUserFavorite = await favoriteModal.findOneAndDelete({
        userUniqueId: userUniqueId,
      })
    }
    const userRequestVerification = await saveRequestModal.find({
      userUniqueId: userUniqueId,
    })
    if (userRequestVerification) {
      deleteUserRequestVerification = await saveRequestModal.deleteMany({
        userUniqueId: userUniqueId,
      })
    }
    const userNotificationToken = await saveNotificationModel.find({
      userUniqueId: userUniqueId,
    })
    if (userNotificationToken) {
      delelteUserNotificationToken = await saveNotificationModel.deleteMany({
        userUniqueId: userUniqueId,
      })
    }
    const userListings = await saveListingModal.find({
      userUniqueId: userUniqueId,
    })
    if (userListings) {
      deleteUserListings = await saveListingModal.deleteMany({
        userUniqueId: userUniqueId,
      })
    }

    const userAccount = await createUserModal.find({
      userUniqueId: userUniqueId,
    })
    if (userAccount) {
      deleteUserAccount = await createUserModal.findOneAndDelete({
        userUniqueId: userUniqueId,
      })
    }

    if (
      deleteUserAccount
      // &&
      // (deleteUserNotification ||
      //   deleteUserFavorite ||
      //   deleteUserRequestVerification ||
      //   delelteUserNotificationToken ||
      //   deleteUserListings)
    ) {
      res.status(200).json({
        reason: 'User deleted successfully',
        statusCode: 200,
        status: 'SUCCESS',
      })
    } else {
      res.status(201).json({
        reason: 'User not found',
        statusCode: 1,
        status: 'SUCCESS',
      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

router.post(
  '/address/addSearchLocation',
  is_Session,
  logEvent,
  async (req, res) => {
    const User = req.session.User; // Retrieve the user ID from the session
    const userUniqueId = User.userUniqueId
      const city = req.body.city
    const locationId = req.body.locationId

    try {
      if (userUniqueId === 'Guest') {
        res.status(200).json({
          reason: 'Profile location added successfully',
          statusCode: 200,
          status: 'SUCCESS',
          dataObject: {
            addressType: 'SearchLocation',
            city: city,
            locationId: locationId,
          },
        })
        return
      } else {
        const getUser = await createUserModal.findOne({ userUniqueId })

        if (getUser) {
          const userAddress = getUser.address
          let bool = false
          let dataToBeSend = {}

          userAddress.forEach(async (element, i) => {
            if (element.addressType == 'SearchLocation') {
              userAddress[i].city = city
              userAddress[i].locationId = locationId
              bool = true
              dataToBeSend = userAddress[i]
            }
          })
          if (!bool && locationId == '-1') {
            dataToBeSend = {
              addressType: 'SearchLocation',
              city: city,
              locationId: locationId,
            }
            userAddress.push(dataToBeSend)
          }

          const dataObject = {
            address: userAddress,
          }
          await createUserModal.findByIdAndUpdate(getUser._id, dataObject, {
            new: true,
          })
          res.status(200).json({
            reason: 'Profile location added successfully',
            statusCode: 200,
            status: 'SUCCESS',
            dataObject: dataToBeSend,
          })
        } else {
          res.status(200).json({
            reason: 'User not found',
            statusCode: 200,
            status: 'SUCCESS',
          })
        }
      }
    } catch (error) {
      console.log(error)
      res.status(500).json(error)
    }
  },
)

router.post(
  '/address/addProfileLocation',
  is_Session,
  logEvent,
  async (req, res) => {
    const User = req.session.User; // Retrieve the user ID from the session
    const userUniqueId = User.userUniqueId
      const city = req.body.city

    try {
      const getUser = await createUserModal.findOne({ userUniqueId })
      if (getUser) {
        const userAddress = getUser.address
        let bool = false
        let dataToBeSend = {}

        userAddress.forEach(async (element, i) => {
          if (element.addressType == 'ProfileLocation') {
            userAddress[i].city != '' && city
            bool = true
            dataToBeSend = userAddress[i]
          }
        })
        if (!bool) {
          dataToBeSend = {
            addressType: 'ProfileLocation',
            city: city,
          }
          userAddress.push(dataToBeSend)
        }
        const dataObject = {
          address: userAddress,
        }
        await createUserModal.findByIdAndUpdate(getUser._id, dataObject, {
          new: true,
        })

        res.status(200).json({
          reason: 'Profile location added successfully',
          statusCode: 200,
          status: 'SUCCESS',
          dataObject: dataToBeSend,
        })
      } else {
        res.status(200).json({
          reason: 'User not found',
          statusCode: 200,
          status: 'SUCCESS',
        })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json(error)
    }
  },
)

module.exports = router
