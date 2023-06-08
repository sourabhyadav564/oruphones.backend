const nodemailer = require('nodemailer');
const saveListingModal = require('../database/modals/device/save_listing_device');
const olxAgentModal = require('../database/modals/global/oru_mitra/agent_olx_modals');
const olxScrappedModal = require('../database/modals/global/oru_mitra/scrapped_olx_listings');
const NonFoundedModels = require('../database/modals/others/non_founded_models');
const { sendMailUtil } = require('./mail_util');
const config = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'mobiruindia22@gmail.com',
		pass: 'rtrmntzuzwzisajb',
	},
});

const sendListingsMail = async () => {
	try {
		let latestData = await olxScrappedModal.aggregate([
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		let submittedData = await saveListingModal.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(new Date().setHours(new Date().getHours() - 24)),
						$lt: new Date(),
					},
					platform: 'portal',
				},
			},
			{
				$group: {
					_id: '$agent',
					count: { $sum: 1 },
				},
			},
			{ $sort: { count: -1 } },
		]);

		let allAgentIds = submittedData.map((item) => item._id);

		let allAgents = await olxAgentModal.find(
			{
				_id: { $in: allAgentIds },
			},
			{ name: 1 }
		);

		let allAgentsObj = {};

		for (let agent of allAgents) {
			allAgentsObj[agent._id] = agent.name;
		}

		let submittedDataWithNames = submittedData.map((item) => {
			return {
				name: allAgentsObj[item._id],
				count: item.count,
			};
		});

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
    <h1>Oru Listings by Agents</h1>
    <h2>Submitted Listings</h2>
    <table>
        <thead>
            <tr>
                <th>Agent</th>
                <th>Count</th>
            </tr>
        </thead>
        <tbody>
            ${submittedDataWithNames
							.map(
								(item) => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.count}</td>
                </tr>
                `
							)
							.join('')}
        </tbody>
    </table>

    <h2>Scrapped Listings</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Count</th>
            </tr>
        </thead>
        <tbody>
            ${latestData
							.map(
								(item) => `
                <tr>
                    <td>${item._id}</td>
                    <td>${item.count}</td>
                </tr>
                `
							)
							.join('')}
        </tbody>
    </table>
    </body>
    </html>
    `;

		sendMailUtil('Total Listings in last 24 hours', mailBody);
		nonFoundedModelMail();
	} catch (error) {}
};

const nonFoundedModelMail = async () => {
	let allData = await NonFoundedModels.find({}).sort({ createdAt: -1 });

	// removing duplicates from allData using model
	let uniqueData = [];
	allData.map((item) => {
		let found = uniqueData.find((x) => x.model == item.model);
		if (!found) {
			uniqueData.push(item);
		}
	});

	allData = uniqueData;

	let dataLen = allData.length;

	let mailBody = `
    <html>
    <head>
        <style>
            table {
            border-collapse: collapse;
            border: 1px solid grey;
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
            border: 1px solid black;
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
    <h1>Non Founded Models</h1>
    <h2>Total Non Founded Models: ${dataLen}</h2>
    <table>
        <thead>
            <tr>
                <th>Make</th>
                <th>Model Name</th>
                <th>Storage</th>
                <th>Ram</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            ${allData
							.map(
								(item) => `
                    <tr>
                        <td>${item.make}</td>
                        <td>${item.model}</td>
                        <td>${item.deviceStorage}</td>
                        <td>${item.ram}</td>
                        <td>${item.createdAt}</td>
                    </tr>
                    `
							)
							.join('')}
        </tbody>
    </table>
    </body>
    </html>
    `;

	sendMailUtil('Non Founded Models', mailBody);
};

module.exports = sendListingsMail;
