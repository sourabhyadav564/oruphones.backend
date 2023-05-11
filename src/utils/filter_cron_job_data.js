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
const lspModal = require('@/database/modals/others/new_scrapped_models');
const newMakeAndModal = require('@/database/modals/others/new_make_and_model');
const testScrappedModal = require('@/database/modals/others/test_scrapped_models');

let lspArray = [];
let finalScrappedModelObject = [];
let currentDate = new Date();
let dateFormat = moment(currentDate).add(10, 'days').calendar();

const allCronJobs = async () => {
	let foundObjects = [];
	let allModelFound = [];
	let allModelNotFound = [];
	const allgsmData = JSON.parse(fs.readFileSync('gsm_arena_filtered.json'));
	// const fileData = JSON.parse(fs.readFileSync("testing_scrapped_datas.json"));
	const fileData = await testScrappedModal.find({}, { _id: 0 });

	let gsmData = allgsmData.filter((item) => item.models.length >= 0);
	gsmData.forEach((element, index) => {
		console.log('gg', index);
		// let make = element.make;
		let marketingName =
			element.marketingName.charAt(0).toUpperCase() +
			element.marketingName.slice(1);
		if (marketingName.includes('(')) {
			let tempName = marketingName.split('(')[0];
			marketingName = tempName.trim();
		}
		let cond = ['Like New', 'Excellent', 'Good', 'Fair'];
		element.storage.forEach((el) => {
			cond.forEach((con) => {
				// TODO file data will be all the data from all the 10 data files
				// TODO .map() will be replaced by .find() for mongoDB
				let variable = fileData.filter((elm) => {
					let mdl = elm.model_name != null ? elm.model_name.toString() : '';
					if (mdl.includes('(')) {
						let tempName2 = mdl.split('(')[0];
						mdl = tempName2.trim();
					}
					if (mdl.includes('|')) {
						let tempName2 = mdl.split('|')[0];
						mdl = tempName2.trim();
					}
					mdl = mdl.toLowerCase().replace(/5g/g, '').trim();
					marketingName = marketingName.toLowerCase().replace(/5g/g, '').trim();
					// handliing poco in model name //

					mdl = mdl.toLowerCase().replace(/poco/g, 'xiaomi poco').trim();

					// handliing poco in model name //
					if (
						mdl.toLowerCase() == marketingName.toLowerCase() &&
						el.includes(elm.storage) &&
						elm.mobiru_condition.includes(con)
					) {
						return elm;
					} else if (
						mdl.toLowerCase() == marketingName.toLowerCase() &&
						elm.storage == '--' &&
						elm.mobiru_condition.includes(con) &&
						elm.price != null
					) {
						return elm;
					}
					// else if (
					//   mdl.toLowerCase().includes(marketingName.toLowerCase()) &&
					//   el.includes(elm.storage) &&
					//   el.includes(elm.ram) &&
					//   elm.mobiru_condition.includes(con)
					// ) {
					//   return elm;
					// }
				});
				if (variable) {
					variable = variable.filter(
						(value, index, self) =>
							index ===
							self.findIndex(
								(t) =>
									t.model_name === value.model_name &&
									t.storage === value.storage &&
									t.ram === value.ram &&
									t.mobiru_condition === value.mobiru_condition &&
									t.type === value.type &&
									t.vendor_id === value.vendor_id
							)
					);

					allModelFound.push(marketingName);
					variable.forEach((elm) => {
						// let elm = variable[0];
						let make = element.make;
						let model = element.marketingName;
						// let model_id = elm.model_id;
						let storage = elm.storage ? `${elm.storage} GB` : '--';
						let ram = elm.ram ? `${elm.ram} GB` : '--';
						let condition = con;
						let tempPrice = elm.price != null ? elm.price.toString() : '';
						if (tempPrice.includes('.')) {
							tempPrice = tempPrice.toString().split('.')[0].toString();
						}
						if (tempPrice.includes(',')) {
							tempPrice = tempPrice.toString().replace(',', '').toString();
						}

						let price = parseInt(tempPrice);
						let type = elm.type;
						let vendor_id = elm.vendor_id;
						// let link = elm.link;
						// let warranty = elm.warranty;

						let dataObj = {
							make,
							model,
							// model_id,
							storage,
							ram,
							condition,
							price,
							type,
							vendor_id,
							// link,
							// warranty,
						};
						foundObjects.push(dataObj);
					});
				} else {
					if (!allModelNotFound.includes('GSM: ' + marketingName)) {
						allModelNotFound.push('GSM: ' + marketingName);
					}
				}
				// });
				// });
			});
		});
		// fs.writeFileSync(
		//     "foundObjects.json",
		//     JSON.stringify(foundObjects, null, 2)
		// );

		if (index == gsmData.length - 1) {
			let lspFinalData = [];
			let allModels = [];
			foundObjects.forEach((eachObject, indx) => {
				console.log('fo', index);

				let modelObj = {
					model: eachObject.model,
					storage: eachObject.storage,
					ram: eachObject.ram,
				};
				if (!allModels.includes(modelObj)) {
					allModels.push(modelObj);
				}
				let objIndex = lspFinalData.findIndex((elm) => {
					return (
						elm.make == eachObject.make &&
						elm.model == eachObject.model &&
						// elm.storage == "-- GB" ||
						elm.storage == eachObject.storage &&
						// elm.ram == "-- GB" ||
						elm.ram == eachObject.ram &&
						elm.condition == eachObject.condition
					);
				});
				if (objIndex == -1) {
					let newObj = {
						make: eachObject.make,
						model: eachObject.model,
						storage: eachObject.storage,
						ram: eachObject.ram,
						condition: eachObject.condition,
						vendor: [
							{
								price: eachObject.price < 1000 ? 1000 : eachObject.price,
								type: eachObject.type,
								vendor_id: eachObject.vendor_id,
							},
						],
						lsp: eachObject.price < 1000 ? 1000 : eachObject.price,
						isDerived: false,
						type: eachObject.type,
					};
					lspFinalData.push(newObj);
				} else {
					let vendorObj = {
						price: eachObject.price < 1000 ? 1000 : eachObject.price,
						type: eachObject.type,
						vendor_id: eachObject.vendor_id,
					};
					lspFinalData[objIndex].vendor.push(vendorObj);

					lspFinalData[objIndex].vendor = lspFinalData[objIndex].vendor.filter(
						(value, index, self) =>
							index ===
							self.findIndex(
								// (t) => t == value
								(t) =>
									t.price === value.price &&
									t.type === value.type &&
									t.vendor_id === value.vendor_id
							)
					);

					if (lspFinalData[objIndex].vendor.length > 1) {
						let foundBuy = false;
						let leastPrice = lspFinalData[objIndex].lsp;
						let newType = lspFinalData[objIndex].type;
						lspFinalData[objIndex].vendor.forEach((eachVendor, i) => {
							if (eachVendor.price >= 1000) {
								if (foundBuy == false || eachVendor.type == 'buy') {
									// lspFinalData[objIndex].lsp =
									//   leastPrice > eachVendor.price
									//     ? eachVendor.price
									//     : leastPrice;
									let lspPrice =
										leastPrice < eachVendor.price
											? leastPrice
											: eachVendor.price;
									lspFinalData[objIndex] = {
										...lspFinalData[objIndex],
										lsp: lspPrice,
									};
									lspFinalData[objIndex].type =
										leastPrice > eachVendor.price ? eachVendor.type : newType;
									leastPrice = lspPrice;

									if (eachVendor.type == 'buy') {
										foundBuy = true;
									}
								}
							}
						});
					}
				}
				if (indx == foundObjects.length - 1) {
					let derivedData = [];
					let conditions = ['Like New', 'Excellent', 'Good', 'Fair'];
					allModels.forEach((model, modelIndex) => {
						let arrWithOutCond = lspFinalData.filter(
							(obj2) =>
								obj2.model == model.model &&
								obj2.storage == model.storage &&
								obj2.ram == model.ram
						);
						if (arrWithOutCond.length > 0) {
							conditions.forEach((con2) => {
								let obj = arrWithOutCond.filter(
									(obj3) => obj3.condition == con2
								);
								if (obj && obj.length > 0) {
									derivedData.push(obj[0]);
								} else {
									let derivedPrice = lspFunction(
										con2,
										arrWithOutCond[0].condition,
										arrWithOutCond[0].lsp
									);

									let newVendors = [];

									arrWithOutCond[0].vendor.forEach((eachVendor) => {
										let dpv = lspFunction(
											con2,
											arrWithOutCond[0].condition,
											eachVendor.price
										);
										let pVendor = {
											price: dpv,
											type: eachVendor.type,
											vendor_id: eachVendor.vendor_id,
										};
										newVendors.push(pVendor);
									});

									// if(derivedPrice){
									let derivedObj = {
										make: arrWithOutCond[0].make,
										model: arrWithOutCond[0].model,
										storage: arrWithOutCond[0].storage,
										ram: arrWithOutCond[0].ram,
										condition: con2,
										vendor: newVendors,
										lsp: derivedPrice,
										isDerived: true,
										type: arrWithOutCond[0].type,
									};

									derivedData.push(derivedObj);
									// }
								}

								if (modelIndex == allModels.length - 1) {
									derivedData = derivedData.filter(
										(value, index, self) =>
											index ===
											self.findIndex(
												// (t) => t == value
												(t) =>
													t.make === value.make &&
													t.model === value.model &&
													t.storage === value.storage &&
													t.ram === value.ram &&
													t.condition === value.condition &&
													t.type === value.type &&
													t.vendor_id === value.vendor_id &&
													t.isDerived === value.isDerived &&
													t.lsp === value.lsp
											)
									);
									// fs.writeFileSync(
									//   "lspDerivedData.json",
									//   JSON.stringify(derivedData, null, 2)
									// );
								}
							});
						}
					});
					calculatingFinalLSP(derivedData);
				}
			});
		}
	});
};

const calculatingFinalLSP = async (lspFinalData) => {
	for (let objIndex = 0; objIndex < lspFinalData.length; objIndex++) {
		let foundBuy = false;
		let leastPrice = lspFinalData[objIndex].lsp;
		let newType = lspFinalData[objIndex].type;
		lspFinalData[objIndex].vendor.forEach((eachVendor, i) => {
			if (eachVendor.price >= 1000) {
				if (foundBuy == false || eachVendor.type == 'buy') {
					let lspPrice =
						leastPrice < eachVendor.price ? leastPrice : eachVendor.price;
					lspFinalData[objIndex] = {
						...lspFinalData[objIndex],
						lsp: lspPrice,
					};
					lspFinalData[objIndex].type =
						leastPrice > eachVendor.price ? eachVendor.type : newType;
					leastPrice = lspPrice;

					if (eachVendor.type == 'buy') {
						foundBuy = true;
					}
				}
			}
		});
		if (objIndex == lspFinalData.length - 1) {
			// fs.writeFileSync(
			//   "lspDerivedData.json",
			//   JSON.stringify(lspFinalData, null, 2)
			// );
			collectData(lspFinalData);
		}
	}
};

const collectData = async (data) => {
	try {
		MongoClient.connect(url, function (err, db) {
			if (err) throw err;
			var dbo = db.db(process.env.Collection);
			dbo
				.collection('complete_lsp_datas')
				.deleteMany({})
				.then(() => {
					dbo
						.collection('complete_lsp_datas')
						.insertMany(data, function (err, res) {
							if (err) throw err;
							console.log(
								`${data.length} documents inserted successfully on ${dateFormat})}`
							);
							db.close();
						});
				});
		});

		let mailOptions = {
			from: 'mobiruindia22@gmail.com',
			// to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp",
			to: 'aman@zenro.co.jp, nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp',
			subject: 'Data has successfully been migrated to MongoDB',
			text:
				'Scrapped data has been successfully migrated to MongoDB in the master LSP table and the number of scrapped models are: ' +
				data.length +
				'. The data is not ready to use for other business logics',
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
};

function lspFunction(condition, gotDataFrom, leastSellingPrice) {
	if (condition === 'Good') {
		if (gotDataFrom === 'Good') {
			return leastSellingPrice;
		} else if (gotDataFrom === 'Excellent') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice - 300;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice - 700;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice - 1300;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice - 1700;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice - 2500;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice - 3500;
				return leastSellingPrice;
			}
		} else if (gotDataFrom === 'Like New') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice - 700;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice - 1500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice - 2500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice - 3500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice - 5500;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice - 8000;
				return leastSellingPrice;
			}
		}
	} else if (condition === 'Excellent') {
		if (gotDataFrom === 'Excellent') {
			return leastSellingPrice;
		} else if (gotDataFrom === 'Good') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice + 300;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice + 700;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice + 1300;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice + 1700;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice + 2500;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice + 3500;
				return leastSellingPrice;
			}
		} else if (gotDataFrom === 'Like New') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice - 400;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice - 800;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice - 1200;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice - 2300;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice - 3000;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice - 4500;
				return leastSellingPrice;
			}
		}
	} else if (condition === 'Like New') {
		if (gotDataFrom === 'Like New') {
			return leastSellingPrice;
		} else if (gotDataFrom === 'Good') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice + 700;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice + 1500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice + 2500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice + 3500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice + 5500;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice + 8000;
				return leastSellingPrice;
			}
		} else if (gotDataFrom === 'Excellent') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice + 400;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice + 800;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice + 1200;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice + 2300;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice + 3000;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice + 4500;
				return leastSellingPrice;
			}
		}
	} else if (condition === 'Fair') {
		if (gotDataFrom === 'Good') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice - 500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice - 1500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice - 2500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice - 3500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice - 5500;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice - 8000;
				return leastSellingPrice;
			}
		} else if (gotDataFrom === 'Excellent') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice - 1200;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice - 2300;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice - 3700;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice - 4700;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice - 8000;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice - 11500;
				return leastSellingPrice;
			}
		} else if (gotDataFrom === 'Like New') {
			if (leastSellingPrice <= 10000) {
				leastSellingPrice = leastSellingPrice - 1500;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
				leastSellingPrice = leastSellingPrice - 3000;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
				leastSellingPrice = leastSellingPrice - 5000;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
				leastSellingPrice = leastSellingPrice - 7000;
				return leastSellingPrice;
			} else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
				leastSellingPrice = leastSellingPrice - 11000;
				return leastSellingPrice;
			} else if (leastSellingPrice > 70000) {
				leastSellingPrice = leastSellingPrice - 16000;
				return leastSellingPrice;
			}
		}
	}
}

const startCalculatingLSP = async () => {
	const allgsmData = await newMakeAndModal.find(
		{ models: { $exists: true, $ne: [] } },
		{ _id: 0 }
	);
	const fileData = await testScrappedModal.find({}, { _id: 0 });
	allCronJobs();
};

module.exports = startCalculatingLSP;
