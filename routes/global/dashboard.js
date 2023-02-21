const express = require("express");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const eventModal = require("../../src/database/modals/others/event_logs");
const router = express.Router();

const initialTIme = new Date(new Date("2022-08-01T00:00:00.000+00:00"));

router.get("/dashboard/home", async (req, res) => {
  try {
    let user = req.query.user;
    let passwd = req.query.password;

    if (user == "admin" && passwd == "adminPwd") {
      // const initialTIme = new Date(new Date("2022-08-01T00:00:00.000+00:00"));
      let allTimeUsers = {};

      let users = await createUserModal.countDocuments();

      // count of users monthly and also add the year
      let monthlyUsers = await createUserModal.aggregate([
        {
          $match: {
            createdAt: {
              $gte: initialTIme,
            },
          },
        },
        {
          $group: {
            _id: {
              // _id will be the year and month like 2021-08
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },
            month: {
              $first: {
                $month: "$createdAt",
              },
            },
            year: {
              $first: {
                $year: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            year: 1,
            month: 1,
          },
        },
      ]);

      let dataObject = {
        allUsers: users,
        monthlyUsers,
      };

      // now find allListings and monthlyListings

      const allListings = await saveListingModal.countDocuments();

      const monthlyListings = await saveListingModal.aggregate([
        {
          $match: {
            createdAt: {
              $gte: initialTIme,
            },
          },
        },
        {
          $group: {
            _id: {
              // _id will be the year and month like 2021-08
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },
            month: {
              $first: {
                $month: "$createdAt",
              },
            },
            year: {
              $first: {
                $year: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            year: 1,
            month: 1,
          },
        },
      ]);

      dataObject.allListings = allListings;
      dataObject.monthlyListings = monthlyListings;

      // now find allVerifiedListings and monthlyVerifiedListings

      const allVerifiedListings = await saveListingModal.countDocuments({
        verified: true,
      });

      const monthlyVerifiedListings = await saveListingModal.aggregate([
        {
          $match: {
            createdAt: {
              $gte: initialTIme,
            },
            verified: true,
          },
        },
        {
          $group: {
            _id: {
              // _id will be the year and month like 2021-08
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },
            month: {
              $first: {
                $month: "$createdAt",
              },
            },
            year: {
              $first: {
                $year: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            year: 1,
            month: 1,
          },
        },
      ]);

      dataObject.allVerifiedListings = allVerifiedListings;
      dataObject.monthlyVerifiedListings = monthlyVerifiedListings;

      res.status(200).json({
        reason: "Data found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    } else {
      res.status(200).json({
        reason: "Data Not found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {},
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/dashboard/listingsByCity", async (req, res) => {
  try {
    let startTime = req.query.startTime || initialTIme;
    let endTime = req.query.endTime || new Date();

    let allListings = await saveListingModal.countDocuments({
      createdAt: {
        $gte: startTime,
        $lte: endTime,
      },
    });

    let cityWiseListings = await saveListingModal.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startTime,
            $lte: endTime,
          },
        },
      },
      {
        $group: {
          _id: "$listingLocation",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const dataObject = {};
    dataObject.allListings = allListings;
    dataObject.cityWiseListings = cityWiseListings;

    res.status(200).json({
      reason: "Listings found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/dashboard/users", async (req, res) => {
  try {
    const timeFor = req.query.timeFor;
    // const cityFor = req.query.cityFor;

    const dataObject = [];
    res.status(200).json({
      reason: "Users found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/dashboard/event", async (req, res) => {
  try {
    const eventFor = req.query.eventFor;

    const allEvents = await eventModal.aggregate([
      {
        $match: {
          "events.eventName": eventFor,
        },
      },
      {
        $group: {
          _id: {
            // _id will be the year and month like 2021-08
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          month: {
            $first: {
              $month: "$createdAt",
            },
          },
          year: {
            $first: {
              $year: "$createdAt",
            },
          },
          eventCount: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);

    // total events for the given eventFor
    const allEventsCount = allEvents.reduce((acc, curr) => {
      return acc + curr.eventCount;
    }, 0);

    const dataObject = {
      allEventsCount,
      allEvents,
    };
    res.status(200).json({
      reason: "Events found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
