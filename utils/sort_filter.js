const bestDealsModal = require("../src/database/modals/others/best_deals_models");

const applySortFilter = async (sortBy, type, page, location) => {
  let totalProducts;
  let completeDeals = [];
  if (location === "India") {
    if (sortBy === "" && type === "all") {
      totalProducts = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"], type })
        .countDocuments();

      completeDeals = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"], type })
        .skip(parseInt(page) * 30)
        .limit(30);
    } else {
      if (sortBy === "HighToLow") {
        totalProducts = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"], type })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"], type })
          .sort({ listingPrice: -1 })
          .collation({ locale: "en_US", numericOrdering: true })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "LowToHigh") {
        totalProducts = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"], type })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"], type })
          .sort({ listingPrice: 1 })
          .collation({ locale: "en_US", numericOrdering: true })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "NewestFirst") {
        totalProducts = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"], type })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"], type })
          .sort({ createdAt: -1 })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "OldestFirst") {
        totalProducts = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"], type })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"], type })
          .sort({ createdAt: 1 })
          .skip(parseInt(page) * 30)
          .limit(30);
      }
    }
  } else {
    if (sortBy === "") {
      totalProducts = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          type,
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .countDocuments();

      completeDeals = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          type,
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .skip(parseInt(page) * 30)
        .limit(30);
    } else {
      if (sortBy === "HighToLow") {
        totalProducts = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .sort({ listingPrice: -1 })
          .collation({ locale: "en_US", numericOrdering: true })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "LowToHigh") {
        totalProducts = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .sort({ listingPrice: 1 })
          .collation({ locale: "en_US", numericOrdering: true })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "NewestFirst") {
        totalProducts = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .sort({ createdAt: -1 })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "OldestFirst") {
        totalProducts = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .sort({ createdAt: 1 })
          .skip(parseInt(page) * 30)
          .limit(30);
      }
    }
  }
  return { totalProducts, completeDeals };
};

module.exports = applySortFilter;
