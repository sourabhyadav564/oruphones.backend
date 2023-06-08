const { FSx } = require('aws-sdk');
const testing_scrapped_data_dump = require('../database/modals/others/migration_model');
const scrappedLogModal = require('../database/modals/others/scrapped_log_models');
const testScrappedModal = require('../database/modals/others/test_scrapped_models');
const fs = require('fs');
require('dotenv').config();
const nodemailer = require('nodemailer');
const NonFoundedModels = require('../database/modals/others/non_founded_models');
const { sendMailUtil } = require('./mail_util');
const config = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'mobiruindia22@gmail.com',
		pass: 'rtrmntzuzwzisajb',
	},
});

const deleteOldData = async () => {
	let expression = {
		$expr: {
			$and: [
				{
					$lte: [
						{
							$cond: {
								if: {
									$eq: ['$updatedAt', null],
								},
								then: '$createdAt',
								else: '$updatedAt',
							},
						},
						new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
					],
				},
				{
					$eq: ['$vendor_id', 13],
				},
			],
		},
	};

	let deletedData = await testScrappedModal.deleteMany(expression);

	let expression2 = {
		$expr: {
			$and: [
				{
					$lte: [
						{
							$cond: {
								if: {
									$eq: ['$updatedAt', null],
								},
								// then use the createdAt field
								then: '$createdAt',
								else: '$updatedAt',
							},
						},
						new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					],
				},
				{
					$eq: ['$type', 'buy'],
				},
			],
		},
	};

	let deletedData2 = await testScrappedModal.deleteMany(expression2);
};

const startDataMigration = async () => {
	// const d = new Date();
	// let date = d.getDate();
	// let month = d.getMonth() + 1;
	// let year = d.getFullYear();

	// date = date < 10 ? '0' + date : date;
	// month = month < 10 ? '0' + month : month;

	let allListings = await testing_scrapped_data_dump.find({
		$and: [
			{
				created_at: {
					// $gte: new Date(`${year}-${month}-${date}T00:00:00.837Z`),
					$gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
				},
			},
			{
				price: {
					$gte: 1000,
				},
			},
		],
	});
	// console.log("listingsLength", allListings.length);

	deleteOldData();

	const ourConditions = [
		'Like New',
		'Good',
		'Excellent',
		'Fair',
		'New - Seal Pack',
	];

	// now for each listing, we need to check if it exists in the testScrappedModal and update its values
	for (let i = 0; i < allListings.length; i++) {
		const listing = allListings[i]['_doc'];

		if (
			listing.type == 'sell' ||
			listing.type == 'Sell' ||
			((listing.type == 'buy' || listing.type == 'Buy') &&
				!(
					listing.make != 'Apple' &&
					(listing.ram == '--' ||
						listing.storage == '--' ||
						listing.ram == null ||
						listing.storage == null)
				) &&
				ourConditions.includes(listing.mobiru_condition) &&
				listing.price > 2500 &&
				listing.link.toString().includes('://'))
		) {
			let findingData = {};

			if (listing['make'] != 'Apple') {
				findingData = {
					make: listing['make'],
					model_name: listing['model_name'],
					storage: listing['storage'],
					ram: listing['ram'],
					mobiru_condition: listing['mobiru_condition'],
					type: listing['type'],
					vendor_id: listing['vendor_id'],
				};
			} else {
				findingData = {
					make: listing['make'],
					model_name: listing['model_name'],
					storage: listing['storage'],
					mobiru_condition: listing['mobiru_condition'],
					type: listing['type'],
					vendor_id: listing['vendor_id'],
				};
			}

			const listingExists = await testScrappedModal.findOne(findingData);

			if (listingExists) {
				await testScrappedModal.updateOne(
					{
						model_name: listingExists['model_name'],
						make: listingExists['make'],
						storage: listingExists['storage'],
						ram: listingExists['ram'],
						mobiru_condition: listingExists['mobiru_condition'],
						type: listingExists['type'],
						vendor_id: listingExists['vendor_id'],
					},
					{
						$set: {
							price: listing['price'],
							actualPrice: listing['actualPrice'],
							ram:
								listingExists['make'] != 'Apple' ? listingExists['ram'] : '--',
							link: listing['link'],
							warranty: listing['warranty'],
						},
					}
				);
			} else {
				let brand = listing['make']
					? listing['make']
					: listing['model_name'].toString().split(' ')[0];
				const newListing = {
					make: brand,
					model_name: listing['model_name'],
					storage: listing['storage'],
					ram: brand != 'Apple' ? listing['ram'] : '--',
					mobiru_condition: listing['mobiru_condition'],
					type: listing['type'],
					vendor_id: listing['vendor_id'],
					price: listing['price'],
					actualPrice: listing['actualPrice'],
					link: listing['link'],
					warranty: listing['warranty'],
				};

				await testScrappedModal.create(newListing);
			}
		}
		if (i == allListings.length - 1) {
			if (process.env.Collection == 'oru_phones_production_database') {
				sendLogMail();
			}
		}
	}
};

const sendLogMail = async () => {
	const VENDORS = {
		6: 'Amazon',
		7: 'Quikr',
		8: 'Cashify',
		9: '2Gud',
		10: 'Budli',
		11: 'Paytm',
		12: 'Yaantra',
		13: 'Sahivalue',
		14: 'Shopcluse',
		15: 'Xtracover',
		16: 'Mobigarage',
		17: 'Instacash',
		18: 'Cashforphone',
		19: 'Recycledevice',
		20: 'Quickmobile',
		21: 'Buyblynk',
		22: 'Electronicbazaar',
		23: 'Flipkart',
		26: 'OLX',
	};

	let allData = await testScrappedModal.aggregate([
		{
			$match: {
				$or: [
					{
						updatedAt: {
							$gte: new Date(new Date().getTime() - 20 * 60 * 60 * 1000),
						},
					},
					{
						createdAt: {
							$gte: new Date(new Date().getTime() - 20 * 60 * 60 * 1000),
						},
					},
				],
			},
		},
		{
			$group: {
				_id: '$vendor_id',
				totalBuyRecords: {
					$sum: {
						$cond: [{ $eq: ['$type', 'buy'] }, 1, 0],
					},
				},
				totalBuyModels: {
					$addToSet: {
						$cond: [{ $eq: ['$type', 'buy'] }, '$model_name', null],
					},
				},
				totalSellRecords: {
					$sum: {
						$cond: [{ $eq: ['$type', 'sell'] }, 1, 0],
					},
				},
				totalSellModels: {
					$addToSet: {
						$cond: [{ $eq: ['$type', 'sell'] }, '$model_name', null],
					},
				},
			},
		},
		{
			$project: {
				totalBuyModels: {
					$filter: {
						input: '$totalBuyModels',
						as: 'item',
						cond: { $ne: ['$$item', null] },
					},
				},
				totalSellModels: {
					$filter: {
						input: '$totalSellModels',
						as: 'item',
						cond: { $ne: ['$$item', null] },
					},
				},
				totalBuyRecords: 1,
				totalSellRecords: 1,
			},
		},
		{
			$sort: {
				_id: 1,
			},
		},
	]);

	let totalBuyRecords = allData.reduce((a, b) => a + b.totalBuyRecords, 0);
	let totalSellRecords = allData.reduce((a, b) => a + b.totalSellRecords, 0);

	let totalBuyModels = allData.reduce((a, b) => {
		return [...a, ...b.totalBuyModels];
	}, []);
	totalBuyModels = [...new Set(totalBuyModels)];
	totalBuyModels = totalBuyModels.length;

	let totalSellModels = allData.reduce((a, b) => {
		return [...a, ...b.totalSellModels];
	}, []);
	totalSellModels = [...new Set(totalSellModels)];
	totalSellModels = totalSellModels.length;

	let mailBody = `
    <html>
    <head>
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          text-align: left;
          padding: 8px;
        }
        th {
          background-color: #f2f2f2;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        h1 {
            text-align: center;
        }
        h2 {
            text-align: center;
        }
      </style>
    </head>
    <body>
    <h1>Scrapped Data Log</h1>
    <table style="border: 1px solid black; border-collapse: collapse; width: 100%;">
      <tr>
        <th style="border: 1px solid black;">Vendor</th>
        <th style="border: 1px solid black;">Total Buy Records</th>
        <th style="border: 1px solid black;">Total Buy Models</th>
        <th style="border: 1px solid black;">Total Sell Records</th>
        <th style="border: 1px solid black;">Total Sell Models</th>
      </tr>
  `;

	allData.map((item) => {
		mailBody += `
      <tr>
        <td style="border: 1px solid black;">${VENDORS[item._id]}</td>
        <td style="border: 1px solid black;">${item.totalBuyRecords}</td>
        <td style="border: 1px solid black;">${item.totalBuyModels.length}</td>
        <td style="border: 1px solid black;">${item.totalSellRecords}</td>
        <td style="border: 1px solid black;">${item.totalSellModels.length}</td>
      </tr>
    `;
	});

	mailBody += `
      <tr style="background-color: #f2f2f2;">
        <td style="border: 1px solid black;">Total</td>
        <td style="border: 1px solid black;">${totalBuyRecords}</td>
        <td style="border: 1px solid black;">${totalBuyModels}</td>
        <td style="border: 1px solid black;">${totalSellRecords}</td>
        <td style="border: 1px solid black;">${totalSellModels}</td>
      </tr>
      </table>
      `;

	mailBody += `
    </body>
    </html>
  `;

	sendMailUtil('Scrapping Logs', mailBody);
};

const startDataMigrationJob = async () => {
	// sendLogMail();
	startDataMigration();
	// nonFoundedModelMail();
	// sendLogMail("Buy");
};

module.exports = startDataMigrationJob;