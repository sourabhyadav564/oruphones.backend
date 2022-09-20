const bestDealsModal = require("../src/database/modals/others/best_deals_models");

const applySortFilter = async (sortBy, type, page, location) => {
  let totalProducts;
  let completeDeals = [];

  let tempVar = type.split(" ");
  let key;
  if (tempVar.length > 1) {
    key = "marketingName";
  } else if (type != "all") {
    key = "make";
  } else {
    key = "all";
  }

  if (location === "India") {
    if (sortBy === "NA" && type === "all") {
      totalProducts = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"] })
        .countDocuments();

      completeDeals = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"] })
        .skip(parseInt(page) * 30)
        .limit(30);
    } else {
      if (sortBy === "Price - High to Low") {
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
        } else if (key === "marketingName") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .sort({ listingPrice: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .sort({ listingPrice: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "Price - Low to High") {
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
        } else if (key === "marketingName") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .sort({ listingPrice: 1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .sort({ listingPrice: 1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "Newest First") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else if (key === "marketingName") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "Oldest First") {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else if (key === "marketingName") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else {
        if (key === "make") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], make: type })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else if (key === "marketingName") {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"], marketingName: type })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({ status: ["Active", "Sold_Out"] })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      }
    }
  } else {
    if (sortBy === "NA" && type === "all") {
      totalProducts = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .countDocuments();

      completeDeals = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .skip(parseInt(page) * 30)
        .limit(30);
    } else {
      if (sortBy === "Price - High to Low") {
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
        } else if (page === "marketingName") {
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
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
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
      } else if (sortBy === "Price - Low to High") {
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
        } else if (key === "marketingName") {
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
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
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
      } else if (sortBy === "Newest First") {
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
        } else if (key === "marketingName") {
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
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else if (sortBy === "Oldest First") {
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
        } else if (key === "marketingName") {
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
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      } else {
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
            .skip(parseInt(page) * 30)
            .limit(30);
        } else if (key === "marketingName") {
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
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          totalProducts = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .countDocuments();

          completeDeals = await bestDealsModal
            .find({
              status: ["Active", "Sold_Out"],
              $or: [
                { listingLocation: location },
                { listingLocation: "India" },
              ],
            })
            .skip(parseInt(page) * 30)
            .limit(30);
        }
      }
    }
  }
  return { totalProducts, completeDeals };
};

module.exports = applySortFilter;
