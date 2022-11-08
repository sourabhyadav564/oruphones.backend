const bestDealsModal = require("../src/database/modals/others/best_deals_models");

// const applySortFilter = async (sortBy, type, page, location, findingData) => {
const applySortFilter = async (sortBy, page, findingData) => {
  let totalProducts;
  let completeDeals = [];
  // let bestDeals = [];
  // let bestDealsCount = [];
  let bestDealsCountNumber = 0;

  // let tempVar = type.split(" ");
  // let key;
  // if (tempVar.length > 1) {
  //   key = "marketingName";
  // } else if (type != "all") {
  //   key = "make";
  // } else {
  //   key = "all";
  // }

  totalProducts = await bestDealsModal.countDocuments(findingData);

  bestDealsCountNumber = await bestDealsModal.countDocuments({
    ...findingData,
    notionalPercentage: {
      $gt: 0,
      $lte: 40,
    },
  });

  if (sortBy === "Price - High to Low") {
    completeDeals = await bestDealsModal
      .find(findingData)
      .sort({ listingPrice: -1 })
      .collation({ locale: "en_US", numericOrdering: true })
      .skip(parseInt(page) * 30)
      .limit(30);
  } else if (sortBy === "Price - Low to High") {
    completeDeals = await bestDealsModal
      .find(findingData)
      .sort({ listingPrice: 1 })
      .collation({ locale: "en_US", numericOrdering: true })
      .skip(parseInt(page) * 30)
      .limit(30);
  } else if (sortBy === "Newest First") {
    completeDeals = await bestDealsModal
      .find(findingData)
      .sort({ createdAt: -1 })
      .skip(parseInt(page) * 30)
      .limit(30);
  } else if (sortBy === "Oldest First") {
    completeDeals = await bestDealsModal
      .find(findingData)
      .sort({ createdAt: 1 })
      .skip(parseInt(page) * 30)
      .limit(30);
  } else {
    // console.log("sortBy", sortBy);
    // console.log("findingData", findingData);
    // sort by notionalPercentage
    completeDeals = await bestDealsModal
      .find(findingData, { _id: 0 })
      // .collation({ locale: "en_US", numericOrdering: true })
      .skip(parseInt(page) * 30)
      .limit(30);
  }

  // if (location === "India") {
  //   if (sortBy === "NA" && type === "all") {
  //     totalProducts = await bestDealsModal
  //       // .find()
  //       .countDocuments({ status: ["Active", "Sold_Out"] });

  //     // bestDeals = await bestDealsModal.find({
  //     //   status: ["Active", "Sold_Out"],

  //     // });

  //     bestDealsCountNumber = await bestDealsModal.countDocuments({
  //       status: ["Active", "Sold_Out"],
  //       notionalPercentage: {
  //         $gt: 0,
  //         $lte: 40,
  //       },
  //     });

  //     // bestDeals.forEach((item, index) => {
  //     //   if (item.notionalPercentage > 0) {
  //     //     bestDealsCount.push("a");
  //     //   }
  //     // });

  //     completeDeals = await bestDealsModal
  //       .find({ status: ["Active", "Sold_Out"] })
  //       .skip(parseInt(page) * 30)
  //       .limit(30);
  //   } else {
  //     if (sortBy === "Price - High to Low") {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"], make: type });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], make: type })
  //           .sort({ listingPrice: -1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], marketingName: type })
  //           .sort({ listingPrice: -1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"] });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"] })
  //           .sort({ listingPrice: -1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     } else if (sortBy === "Price - Low to High") {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"], make: type });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });
  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], make: type })
  //           .sort({ listingPrice: 1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], marketingName: type })
  //           .sort({ listingPrice: 1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"] });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"] })
  //           .sort({ listingPrice: 1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     } else if (sortBy === "Newest First") {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"], make: type });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], make: type })
  //           .sort({ createdAt: -1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], marketingName: type })
  //           .sort({ createdAt: -1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"] });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"] })
  //           .sort({ createdAt: -1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     } else if (sortBy === "Oldest First") {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"], make: type });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], make: type })
  //           .sort({ createdAt: 1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], marketingName: type })
  //           .sort({ createdAt: 1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"] });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"] })
  //           .sort({ createdAt: 1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     } else {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"], make: type });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], make: type })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"], marketingName: type })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({ status: ["Active", "Sold_Out"] });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({ status: ["Active", "Sold_Out"] })
  //           .sort({ createdAt: 1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     }
  //   }
  // } else {
  //   if (sortBy === "NA" && type === "all") {
  //     totalProducts = await bestDealsModal
  //       // .find()
  //       .countDocuments({
  //         status: ["Active", "Sold_Out"],
  //         $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //       });

  //     bestDealsCountNumber = await bestDealsModal.countDocuments({
  //       status: ["Active", "Sold_Out"],
  //       $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //       notionalPercentage: {
  //         $gt: 0,
  //         $lte: 40,
  //       },
  //     });

  //     // bestDeals = await bestDealsModal.find({
  //     //   status: ["Active", "Sold_Out"],
  //     //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //     // });

  //     // bestDeals.forEach((item, index) => {
  //     //   if (item.notionalPercentage > 0) {
  //     //     bestDealsCount.push(item);
  //     //   }
  //     // });

  //     completeDeals = await bestDealsModal
  //       .find({
  //         status: ["Active", "Sold_Out"],
  //         $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //       })
  //       .skip(parseInt(page) * 30)
  //       .limit(30);
  //   } else {
  //     if (sortBy === "Price - High to Low") {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ listingPrice: -1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ listingPrice: -1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal.find().countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ listingPrice: -1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     } else if (sortBy === "Price - Low to High") {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ listingPrice: 1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ listingPrice: 1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ listingPrice: 1 })
  //           .collation({ locale: "en_US", numericOrdering: true })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     } else if (sortBy === "Newest First") {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ createdAt: -1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ createdAt: -1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ createdAt: -1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     } else if (sortBy === "Oldest First") {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ createdAt: 1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ createdAt: 1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .sort({ createdAt: 1 })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     } else {
  //       if (key === "make") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           make: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   make: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             make: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else if (key === "marketingName") {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           marketingName: type,
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   marketingName: type,
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             marketingName: type,
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       } else {
  //         totalProducts = await bestDealsModal
  //           // .find()
  //           .countDocuments({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           });

  //         bestDealsCountNumber = await bestDealsModal.countDocuments({
  //           status: ["Active", "Sold_Out"],
  //           $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //           notionalPercentage: {
  //             $gt: 0,
  //             $lte: 40,
  //           },
  //         });

  //         // bestDeals = await bestDealsModal.find({
  //         //   status: ["Active", "Sold_Out"],
  //         //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
  //         // });

  //         // bestDeals.forEach((item, index) => {
  //         //   if (item.notionalPercentage > 0) {
  //         //     bestDealsCount.push(item);
  //         //   }
  //         // });

  //         completeDeals = await bestDealsModal
  //           .find({
  //             status: ["Active", "Sold_Out"],
  //             $or: [
  //               { listingLocation: location },
  //               { listingLocation: "India" },
  //             ],
  //           })
  //           .skip(parseInt(page) * 30)
  //           .limit(30);
  //       }
  //     }
  //   }
  // }

  return {
    totalProducts,
    completeDeals,
    bestDealsCount: bestDealsCountNumber,
  };
};

module.exports = applySortFilter;
