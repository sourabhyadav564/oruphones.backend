const express = require('express');
// const connection = require("@/database/mysql_connection");
const fs = require('fs');
const nodemailer = require('nodemailer');
const moment = require('moment');

const dotenv = require('dotenv');
dotenv.config();

const config = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'mobiruindia22@gmail.com',
		pass: 'eghguoshcuniexbf',
	},
});

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO;

// require("@/database/connection");
const scrappedModal = require('@/database/modals/others/scrapped_models');
// const smartphoneModal = require("@/database/modals/others/smartphone_models");
const amazonScrappedModal = require('@/database/modals/others/amazon_scraped_models');

let lspArray = [];
let finalScrappedModelObject = [];
let currentDate = new Date();
let dateFormat = moment(currentDate).add(10, 'days').calendar();

// try {
//   MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db(process.env.Collection);
//     // var myobj = { name: "Company Inc", address: "Highway 37" };
//     dbo.collection("complete_scrapped_models").deleteMany({});
//       // .delete(lspArray, function (err, res) {
//       //   if (err) throw err;
//       //   console.log(
//       //     `${
//       //       lspArray.length
//       //     } documents inserted successfully on ${Date.now()}`
//       //   );
//       //   db.close();
//       // });
//   });
// } catch (error) {
//   console.log(error);
// }

const calculate_LSP_BUY = async () => {
	try {
		let query =
			'select * from `web_scraper_modelwisescraping` where created_at > now() - interval 3 day;select * from `web_scraper_model`;';

		connection.query(query, [2, 1], (err, results, fields) => {
			if (err) {
				console.log(err);
			} else {
				let models = results[1];
				let scrappedModels = results[0];
				// fs.writeFileSync("scrapped.json", JSON.stringify(scrappedModels));

				scrappedModels.forEach(async (item, index) => {
					let lspObject = {};
					let found = false;
					if (item.storage === null) {
						console.error('storage is null: ', item.model_id);
					}
					lspArray.forEach(async (element, i) => {
						if (
							element.model_id === item.model_id &&
							(element.mobiru_condition === item.mobiru_condition ||
								(element.mobiru_condition === 'Excellent' &&
									item.mobiru_condition === null)) &&
							element.storage === `${item.storage} GB` &&
							element.type === 'buy'
						) {
							if (element.price == item.price) {
								found = true;
							} else {
								lspArray.splice(i, 1);
								// found = true;
							}
						}
					});
					// getting model name from model object
					if (!found) {
						const matchedModel = models.find((elem) => {
							// elem.id === item.model_id;
							if (elem.id === item.model_id) {
								return elem;
							}
						});
						lspObject['model_id'] = item.model_id;
						lspObject['model_name'] = matchedModel.name;
						lspObject['price'] = item.price;
						lspObject['mobiru_condition'] =
							item.mobiru_condition ?? 'Excellent';
						lspObject['storage'] = item.storage ? `${item.storage} GB` : '0 GB';
						lspObject['ram'] = item.ram;
						lspObject['link'] = item.link;
						lspObject['warranty'] = item.warranty;
						lspObject['vendor_id'] = item.vendor_id;
						lspObject['type'] = 'buy';
						lspObject['actualPrice'] = item.price;
						lspArray.push(lspObject);
						// try {
						//     const refindedScrappedModelObject = new scrappedModal(lspObject);
						//     const savedObject = await refindedScrappedModelObject.save();
						//     if(savedObject) {
						//         console.log("Huryyyyyyyy");
						//     } else {
						//         console.log("Nooooo");
						//     }
						// } catch (error) {
						//     console.log(error);
						// }
					}
				});
				// try {
				//   MongoClient.connect(url, function (err, db) {
				//     if (err) throw err;
				// var dbo = db.db(process.env.Collection);
				//     // var myobj = { name: "Company Inc", address: "Highway 37" };
				//     dbo
				//       .collection("buy_scrapped_models")
				//       .insertMany(lspArray, function (err, res) {
				//         if (err) throw err;
				//         console.log(`${lspArray.length} documents inserted successfully`);
				//         db.close();
				//       });
				//   });
				// } catch (error) {
				//   console.log(error);
				// }
				// fs.writeFileSync("lsp.json", JSON.stringify(lspArray));
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

const calculate_LSP_SELL = async () => {
	try {
		let query =
			'select * from `web_scraper_sellmodelwisescraping` where created_at > now() - interval 3 day;select * from `web_scraper_model`;';

		connection.query(query, [2, 1], (err, results, fields) => {
			if (err) {
				console.log(err);
			} else {
				let models = results[1];
				let scrappedModels = results[0];
				// fs.writeFileSync("scrapped.json", JSON.stringify(scrappedModels));

				// let lspArray = [];
				scrappedModels.forEach(async (item, index) => {
					let lspObject = {};
					let found = false;
					lspArray.forEach(async (element, i) => {
						if (
							element.model_id === item.model_id &&
							(element.mobiru_condition === item.mobiru_condition ||
								element.mobiru_condition === 'Like New') &&
							element.storage === `${item.storage} GB` &&
							element.type === 'sell'
						) {
							if (element.price == item.price) {
								found = true;
							} else {
								lspArray.splice(i, 1);
								// found = true;
							}
						}
					});
					if (!found) {
						const matchedModel = models.find((elem) => {
							// elem.id === item.model_id;
							if (elem.id === item.model_id) {
								return elem;
							}
						});
						// let derivedPrice = 0;
						// if (item.heading != null) {
						//   derivedPrice = item.heading.includes("Samsung")
						//     ? item.price + item.price * 0.4
						//     : item.price + item.price * 0.2;

						//   console.log(
						//     item.heading.split(" ")[0],
						//     " : price: ",
						//     item.price,
						//     "derivedPrice: ",
						//     derivedPrice
						//   );
						// }
						lspObject['model_id'] = item.model_id;
						lspObject['model_name'] = matchedModel.name;
						// lspObject["price"] = Math.ceil(derivedPrice);
						lspObject['price'] = item.price;
						lspObject['mobiru_condition'] = item.mobiru_condition ?? 'Like New';
						lspObject['storage'] = item.storage ? `${item.storage} GB` : '0 GB';
						lspObject['ram'] = item.ram;
						lspObject['link'] = item.link;
						lspObject['warranty'] = item.warranty;
						lspObject['vendor_id'] = item.vendor_id;
						lspObject['type'] = 'sell';
						lspObject['actualPrice'] = item.price;
						lspArray.push(lspObject);
						// try {
						//     const refindedScrappedModelObject = new scrappedModal(lspObject);
						//     const savedObject = await refindedScrappedModelObject.save();
						//     if(savedObject) {
						//         console.log("Huryyyyyyyy");
						//     } else {
						//         console.log("Nooooo");
						//     }
						// } catch (error) {
						//     console.log(error);
						// }
					}
				});

				let finalBuyLspArray = lspArray.filter((item) => {
					return item.type === 'buy';
				});

				let finalSellLspArray = lspArray.filter((item) => {
					return item.type === 'sell';
				});

				finalScrappedModelObject.push(...finalBuyLspArray);

				finalSellLspArray.forEach((item) => {
					let price;

					if (item.mobiru_condition === 'Like New') {
						finalScrappedModelObject.push(item);
						// item.mobiru_condition = "Excellent";
						item = {
							...item,
							mobiru_condition: 'Excellent',
						};
						if (item.actualPrice < 10000 && item.actualPrice > 1000) {
							price = item.actualPrice - 400;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice < 20000 && item.actualPrice >= 10000) {
							price = item.actualPrice - 800;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 20000 && item.actualPrice < 30000) {
							price = item.actualPrice - 1200;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 30000 && item.actualPrice < 50000) {
							price = item.actualPrice - 2300;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 50000 && item.actualPrice < 70000) {
							price = item.actualPrice - 3000;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 70000) {
							price = item.actualPrice - 4500;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						}
						finalScrappedModelObject.push(item);

						// item.mobiru_condition = "Good";
						item = {
							...item,
							mobiru_condition: 'Good',
						};
						if (item.actualPrice < 10000 && item.actualPrice > 1000) {
							price = item.actualPrice - 700;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice < 20000 && item.actualPrice >= 10000) {
							price = item.actualPrice - 1500;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 20000 && item.actualPrice < 30000) {
							price = item.actualPrice - 2500;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 30000 && item.actualPrice < 50000) {
							price = item.actualPrice - 3500;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 50000 && item.actualPrice < 70000) {
							price = item.actualPrice - 5500;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 70000) {
							price = item.actualPrice - 8000;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						}
						finalScrappedModelObject.push(item);

						// item.mobiru_condition = "Fair";
						item = {
							...item,
							mobiru_condition: 'Fair',
						};
						if (item.actualPrice < 10000 && item.actualPrice > 1000) {
							price = item.actualPrice - 1500;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice < 20000 && item.actualPrice >= 10000) {
							price = item.actualPrice - 3000;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 20000 && item.actualPrice < 30000) {
							price = item.actualPrice - 5000;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 30000 && item.actualPrice < 50000) {
							price = item.actualPrice - 7000;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 50000 && item.actualPrice < 70000) {
							price = item.actualPrice - 11000;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						} else if (item.actualPrice >= 70000) {
							price = item.actualPrice - 16000;
							item = {
								...item,
								actualPrice: price,
								price: price,
								// price: item.model_name.includes("Samsung")
								//   ? item.actualPrice + item.actualPrice * 0.4
								//   : item.actualPrice + item.actualPrice * 0.2,
							};
						}
						finalScrappedModelObject.push(item);
					}
				});

				calculate_LSP_For_Amazon_Exchange();

				// try {
				//   MongoClient.connect(url, function (err, db) {
				//     if (err) throw err;
				// var dbo = db.db(process.env.Collection);
				//     dbo
				//       .collection("complete_scrapped_models")
				//       .deleteMany({})
				//       .then(() => {
				//         dbo
				//           .collection("complete_scrapped_models")
				//           .insertMany(finalScrappedModelObject, function (err, res) {
				//             if (err) throw err;
				//             console.log(
				//               `${finalScrappedModelObject.length} documents inserted successfully on ${dateFormat})}`
				//             );
				//             db.close();
				//           });
				//       });
				//   });

				//   let mailOptions = {
				//     from: "mobiruindia22@gmail.com",
				//     // to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp",
				//     to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp",
				//     subject: "Data has successfully been migrated to MongoDB",
				//     text:
				//       "Scrapped data has been successfully migrated to MongoDB, number of scrapped models: " +
				//       lspArray.length,
				//   };

				//   config.sendMail(mailOptions, function (err, result) {
				//     if (err) {
				//       console.log(err);
				//     } else {
				//       console.log("Email sent: " + result.response);
				//     }
				//   });
				// } catch (error) {
				//   console.log(error);
				// }
				// fs.writeFileSync("lsp.json", JSON.stringify(finalScrappedModelObject));
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

const calculate_LSP_For_Amazon_Exchange = async () => {
	const amazonData = await amazonScrappedModal.find();
	amazonData.forEach((item) => {
		item = {
			...item._doc,
			// price: item.model_name.includes("Samsung")
			//   ? item.actualPrice * 1.4
			//   : item.actualPrice * 1.2,
			price: item.actualPrice,
		};
		finalScrappedModelObject.push(item);
	});

	try {
		MongoClient.connect(url, function (err, db) {
			if (err) throw err;
			var dbo = db.db(process.env.Collection);
			dbo
				.collection('complete_scrapped_models')
				.deleteMany({})
				.then(() => {
					dbo
						.collection('complete_scrapped_models')
						.insertMany(finalScrappedModelObject, function (err, res) {
							if (err) throw err;
							console.log(
								`${finalScrappedModelObject.length} documents inserted successfully on ${dateFormat})}`
							);
							db.close();
						});
				});
		});

		let mailOptions = {
			from: 'mobiruindia22@gmail.com',
			// to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp",
			to: 'aman@zenro.co.jp, nishant.sharma@zenro.co.jp',
			subject: 'Data has successfully been migrated to MongoDB',
			text:
				'Scrapped data has been successfully migrated to MongoDB, number of scrapped models: ' +
				lspArray.length,
		};

		config.sendMail(mailOptions, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				console.log('Email sent: ' + result.response);
			}
		});
	} catch (error) {
		console.log(error);
	}
	// fs.writeFileSync("lsp.json", JSON.stringify(finalScrappedModelObject));
};

const start_migration = async () => {
	calculate_LSP_BUY().then(() => {
		console.log('entered into then');
		calculate_LSP_SELL();
		console.log('exited from then');
	});
};

module.exports = start_migration;
