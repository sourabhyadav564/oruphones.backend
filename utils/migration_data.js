const testing_scrapped_data_dump = require("../src/database/modals/others/migration_model");
const testScrappedModal = require("../src/database/modals/others/test_scrapped_models");

const startDataMigration = async () => {
  const d = new Date();
  let date = d.getDate() - 1;
  // console.log("date", date);
  // console.log("date ", new Date(`2022-10-${date}T20:00:00.837Z`));
  let allListings = await testing_scrapped_data_dump.find({
    $and: [
      {
        created_at: {
          $gte: new Date(`2022-10-${date}T20:00:00.837Z`),
        },
      },
      // {
      //   $or: [
      //     {
      //       created_at: {
      //         $gte: new Date(`2022-10-${date}T20:00:00.837Z`),
      //       },
      //     },
      //     {
      //       vendor_id: 26,
      //     },
      //   ],
      // },
      {
        price: {
          $gte: 1000,
        },
      },
    ],
  });
    // console.log("listingsLength", allListings);

  // now for each listing, we need to check if it exists in the testScrappedModal and update its values
  for (let i = 0; i < allListings.length; i++) {
    const listing = allListings[i];
    const { listingId } = listing;
    const listingExists = await testScrappedModal.findOne({
      make: listing["make"],
      model_name: listing["model_name"],
      storage: listing["storage"],
      ram: listing["make"] != "Apple" ? listing["ram"] : null,
      mobiru_condition: listing["mobiru_condition"],
      type: listing["type"],
      vendor_id: listing["vendor_id"],
    });
    if (listingExists) {
      //   console.log("listingExists", listingExists);
      // update the listing
      await testScrappedModal.updateOne(
        {
          model_name: listingExists["model_name"],
          make: listingExists["make"],
          storage: listingExists["storage"],
          ram: listingExists["ram"],
          mobiru_condition: listingExists["mobiru_condition"],
          type: listingExists["type"],
          vendor_id: listingExists["vendor_id"],
        },
        {
          $set: {
            price: listing["price"],
            actualPrice: listing["actualPrice"],
            link: listing["link"],
            warranty: listing["warranty"],
            created_at: listing["created_at"],
          },
        }
      );
    } else {
      // crreate new object by listing
      const newListing = {
        make: listing["make"],
        model_name: listing["model_name"],
        storage: listing["storage"],
        ram: listing["ram"],
        mobiru_condition: listing["mobiru_condition"],
        type: listing["type"],
        vendor_id: listing["vendor_id"],
        price: listing["price"],
        actualPrice: listing["actualPrice"],
        link: listing["link"],
        warranty: listing["warranty"],
        created_at: listing["created_at"] ?? new Date(),
      };

      // create the listing
      await testScrappedModal.create(newListing);
    }
    if(i == allListings.length -1){
        console.log("migration done")
    }
  }
};

const startDataMigrationJob = async () => {
  startDataMigration();
};

module.exports = startDataMigrationJob;
