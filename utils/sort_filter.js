const bestDealsModal = require("../src/database/modals/others/best_deals_models");

const applySortFilter = async (sortBy, type, page, location) => {
  console.log("location", location);
  console.log("type", type);
  console.log("sortBy", sortBy);
  console.log("page", page);
  let totalProducts;
  let completeDeals = [];

  let tempVar = type.split(" ");
  console.log("tempVar", tempVar);
  console.log("tempVar", tempVar.length);
  let key;
  if (tempVar.length > 1) {
    key = "marketingName";
  } else {
    key = "make";
  }

  if (location === "India") {
    if (sortBy === "" || type === "all") {
        totalProducts = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"] })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({ status: ["Active", "Sold_Out"] })
          .skip(parseInt(page) * 30)
          .limit(30);
    } else {
      if (sortBy === "HighToLow") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .sort({ listingPrice: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .sort({ listingPrice: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "LowToHigh") {
        console.log("LowToHigh");
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .sort({ listingPrice: 1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          console.log("LowToHigh2");
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], 
            marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], 
            marketingName: type })
            .sort({ listingPrice: 1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "NewestFirst") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "OldestFirst") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      }
    }
  } else {
    if (sortBy === "" && type === "all") {
        totalProducts = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            make: type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();

        completeDeals = await bestDealsModal
          .find({
            status: ["Active", "Sold_Out"],
            make: type,
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 30)
          .limit(30);
    } else {
      if (sortBy === "HighToLow") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              make: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              make: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ listingPrice: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              marketingName: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              marketingName: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ listingPrice: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "LowToHigh") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              make: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              make: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ listingPrice: 1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              marketingName: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              marketingName: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ listingPrice: 1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "NewestFirst") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              make: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              make: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              marketingName: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              marketingName: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "OldestFirst") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              make: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              make: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              marketingName: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              marketingName: type,
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      }
    }
  }
  return { totalProducts, completeDeals };
};

module.exports = applySortFilter;
