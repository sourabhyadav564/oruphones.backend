const express = require("express");
const router = express.Router();

const logEvent = require("../../src/middleware/event_logging");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const eventModal = require("../../src/database/modals/others/event_logs");
const createUserModal = require("../../src/database/modals/login/login_create_user");

router.get("/logeventinfo", async (req, res) => {
  try {
    res.status(200).send({
      status: "SUCCESS",
      statusCode: 200,
      reason: "Event logged successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/logs/geteventinfo", async (req, res) => {
  const location = req.query.location;
  try {
    const currentDate = new Date();
    const total_logs_captured = await eventModal.countDocuments({
      createdAt: currentDate,
    });

    // const total_logs_captured_geographically = await eventModal.countDocuments({
    //   location: location,
    // });

    const total_unique_users = await eventModal
      .distinct("userUniqueId")
      .countDocuments();

    const total_app_opens = await eventModal.countDocuments({
      events: { $elemMatch: { eventName: "SESSION_CREATED" } },
    });

    const total_unique_users_with_app_opens = await eventModal
      .distinct("userUniqueId", {})
      .countDocuments({
        events: { $elemMatch: { eventName: "SESSION_CREATED" } },
      });

    const total_new_listing_attempted = await eventModal.countDocuments({
      events: { $elemMatch: { eventName: "HOME_SELLNOW_SELECTED" } },
    });

    const total_new_listing_completed = await eventModal.countDocuments({
      events: { $elemMatch: { eventName: "ADDLISTING_ADD_SUCCESS" } },
    });

    const total_new_listing_completed_without_photos =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            $and: [
              { eventName: { $eq: "ADDLISTING_ADD_SUCCESS" } },
              {
                eventName: {
                  $not: { $ne: "ADDLISTING_UPLOAD_PHOTOS_SUCCESS" },
                },
              },
            ],
          },
        },
      });

    const total_listings_verification_attempted =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            // eventName: "ADDLISTING_VERIFY_NOW",
            $or: [
              { eventName: "ADDLISTING_VERIFY_NOW" },
              { eventName: "LISTINGINFO_VERIFY_SELECTED" },
              { eventName: "MYLISTINGS_VERIFYNOW_SELECTED" },
              { eventName: "MYLISTINGS_VERIFYNOW_HELP_SELECTED" },
            ],
          },
        },
      });

    const total_number_of_listing_activated = await eventModal.countDocuments({
      events: {
        $elemMatch: {
          // eventName: "MYLISTINGS_VERIFYNOW_HELP_SELECTED",
          $or: [
            { eventName: "MYLISTINGS_VERIFYNOW_HELP_SELECTED" },
            { eventName: "LISTINGINFO_ACTIVATENOW_SELECTED" },
            { eventName: "LISTINGINFO_ACTIVATENOW_SUCCESS" },
          ],
        },
      },
    });

    const total_number_of_listing_deleted = await eventModal.countDocuments({
      events: {
        $elemMatch: {
          // eventName: "MYLISTINGS_DELETE_SELECTED",
          $or: [
            { eventName: "MYLISTINGS_DELETE_SELECTED" },
            { eventName: "LISTINGINFO_DELETE_SELECTED" },
            { eventName: "LISTINGINFO_DELETE_SUCCESS" },
          ],
        },
      },
    });

    const total_number_of_contact_seller_attempted =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            eventName: "LISTINGINFO_CONTACT_SELLER",
          },
        },
      });

    const total_number_of_request_verification_attempted =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            eventName: "LISTINGINFO_REQUEST_VERIFICATION",
          },
        },
      });

    const total_listings_verified_from_web = await eventModal.countDocuments({
      srcFrom: "Web",
      events: {
        $elemMatch: {
          // eventName: "ADDLISTING_VERIFY_NOW",
          $or: [
            { eventName: "ADDLISTING_VERIFY_NOW" },
            { eventName: "LISTINGINFO_VERIFY_SELECTED" },
            { eventName: "MYLISTINGS_VERIFYNOW_SELECTED" },
            { eventName: "MYLISTINGS_VERIFYNOW_HELP_SELECTED" },
          ],
        },
      },
    });

    const total_number_of_visits_at_service_tab =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            eventName: "HOME_SERVICES_SELECTED",
          },
        },
      });

    const total_number_of_visits_at_buyers_verification =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            eventName: "BUYER_VERIFICATION_LINK_CLICKED",
          },
        },
      });

    const total_number_of_buyers_verification_completed =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            eventName: "BUYER_VERIFICATION_COMPLETED",
          },
        },
      });

    const total_listings_verification_completed =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            eventName: "TEST_RESULT_SELL_PRICE_CHANGED",
          },
        },
      });

    const total_diagnostics_session_invocked = await eventModal.countDocuments({
      events: {
        $elemMatch: {
          eventName: "DIAGNOSTICS_SESSION_INVOKED",
        },
      },
    });

    const total_diagnostics_session_completed = await eventModal.countDocuments(
      {
        events: {
          $elemMatch: {
            eventName: "DIAGNOSTICS_SESSION_COMPLETED",
          },
        },
      }
    );

    const total_data_transfer_session_invocked =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            eventName: "DATA_TRANSFER_SESSION_INVOKED",
          },
        },
      });

    const total_data_transfer_session_completed =
      await eventModal.countDocuments({
        events: {
          $elemMatch: {
            eventName: "DATA_TRANSFER_SESSION_COMPLETED",
          },
        },
      });

    const total_listings = await saveListingModal.find({});
    let listing_with_recommended_price = [];
    total_listings.forEach(async (listing) => {
      if (
        listing?.recommendedPriceRange != NaN &&
        listing?.recommendedPriceRange != undefined
      ) {
        if (
          listing?.recommendedPriceRange.toString().length > 0 &&
          listing?.recommendedPriceRange.toString() != "- - -" &&
          listing?.recommendedPriceRange.toString() != "---"
        ) {
          listingPrice = listing?.listingPrice;
          minPrice = parseInt(
            listing?.recommendedPriceRange.split("-")[0].trim()
          );
          maxPrice = parseInt(
            listing?.recommendedPriceRange.split("-")[1].trim()
          );

          if (listingPrice >= minPrice && listingPrice <= maxPrice) {
            listing_with_recommended_price.push(listing?.listingId);
          }
        }
      }
      total_listing_with_price_within_recommended_price =
        listing_with_recommended_price.length;
    });

    const total_listings_older_then_90_days =
      await saveListingModal.countDocuments({
        createdAt: {
          $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      });

    const favrouit_listings = await favoriteModal.find({
      fav_listings: { $ne: [] },
    });

    let fav_listing_details = [];

    favrouit_listings.forEach(async (listing) => {
      listing.fav_listings.forEach(async (fav_listing) => {
        const listing_data = await saveListingModal.findOne({
          listingId: fav_listing,
        });
        if (listing_data) {
          fav_listing_details.push(listing_data.marketingName);
          // in the fav_listing_details there are multiple model name, get the most repeated one
          const fav_most_repeated_model_name = fav_listing_details.reduce(
            (acc, curr) => {
              acc[curr] = (acc[curr] || 0) + 1;
              return acc;
            }
          );
          const fav_most_repeated_model_name_key = Object.keys(
            fav_most_repeated_model_name
          )[0];
          const _fav_most_repeated_model_name_value =
            fav_most_repeated_model_name[fav_most_repeated_model_name_key];
          // console.log("most_repeated_model_name", fav_most_repeated_model_name);
          // console.log(
          //   "most_repeated_model_name_value",
          //   _fav_most_repeated_model_name_value
          // );
        }
      });
    });

    const listing_with_name_other_then_guest = await saveListingModal.find({
      userName: { $ne: "Guest" },
    });

    let listing_with_real_name = [];

    listing_with_name_other_then_guest.forEach(async (listing) => {
      listing_with_real_name.push(listing.listedBy);
    });

    // console.log("listing_with_real_name", listing_with_real_name);
    const listing_with_real_name_unique = listing_with_real_name.filter(
      (item, index, array) => array.indexOf(item) === index
    );
    // console.log("listing_with_real_name_unique", listing_with_real_name_unique);

    const total_users_registered_today = await createUserModal.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    const sessions = await eventModal.find({});
    let session_duration_in_seconds = [];
    sessions.forEach(async (session) => {
      const session_duration =
        (session.updatedAt.getTime() - session.createdAt.getTime()) / 1000;
      session_duration_in_seconds.push(session_duration);
    });
    // console.log("session_duration_in_seconds", session_duration_in_seconds);
    // const session_duration_in_seconds_sum = session_duration_in_seconds.reduce(
    //   (acc, curr) => acc + curr
    // );
    // console.log("session_duration_in_seconds_sum", session_duration_in_seconds_sum);
    // const session_duration_in_seconds_avg =
    //   session_duration_in_seconds_sum / session_duration_in_seconds.length;
    // console.log("session_duration_in_seconds_avg", session_duration_in_seconds_avg);

    // const total_sessions = await eventModal.countDocuments({});
    // const total_sessions_duration =
    //   session_duration_in_seconds_sum / total_sessions;
    // console.log("total_sessions_duration", total_sessions_duration);

    // const total_sessions_duration_avg =
    //   session_duration_in_seconds_avg / total_sessions;
    // console.log("total_sessions_duration_avg", total_sessions_duration_avg);

    let complete_marketing_name = [];
    const total_marketing_name_from_listing = await saveListingModal.find({
      marketingName: { $ne: "" },
    });

    total_marketing_name_from_listing.forEach(async (listing) => {
      complete_marketing_name.push(listing.marketingName);
    });

    // console.log("complete_marketing_name", complete_marketing_name);
    const complete_marketing_name_unique = complete_marketing_name.filter(
      (item, index, array) => array.indexOf(item) === index
    );
    // console.log("complete_marketing_name_unique", complete_marketing_name_unique);

    const total_user_device_platform = await eventModal.find({});
    let user_device_platform = [];
    total_user_device_platform.forEach(async (user) => {
      user_device_platform.push(user);
    });

    let user_device_platform_android = [];
    let user_device_platform_ios = [];
    user_device_platform.forEach(async (user) => {
      if (user.devicePlatform === "Android") {
        user_device_platform_android.push(user?.devicePlatform);
      }
      if (user.devicePlatform === "iOS") {
        user_device_platform_ios.push(user?.devicePlatform);
      }
    });
    // console.log("user_device_platform_android", user_device_platform_android);
    // console.log("user_device_platform_ios", user_device_platform_ios);

    res.json({
      total_logs_captured,
      total_app_opens,
      total_unique_users_with_app_opens,
      total_new_listing_attempted,
      total_new_listing_completed,
      total_new_listing_completed_without_photos,
      total_listings_verification_attempted,
      total_number_of_listing_activated,
      total_number_of_listing_deleted,
      total_number_of_contact_seller_attempted,
      total_number_of_request_verification_attempted,
      total_listings_verified_from_web,
      total_number_of_visits_at_service_tab,
      total_number_of_visits_at_buyers_verification,
      total_number_of_buyers_verification_completed,
      total_listings_verification_completed,
      total_diagnostics_session_invocked,
      total_diagnostics_session_completed,
      total_data_transfer_session_invocked,
      total_data_transfer_session_completed,
      total_listing_with_price_within_recommended_price,
      total_listings_older_then_90_days,
      fav_listing_details,
      listing_with_real_name,
      total_users_registered_today,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
