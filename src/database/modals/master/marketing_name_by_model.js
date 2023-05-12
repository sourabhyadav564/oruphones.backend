const mongoose = require('mongoose');
const validator = require('validator');

const gsmarenaModelSchema = new mongoose.Schema(
	{
		models: {
			type: {
				Launch: {
					Announced: {
						type: String,
					},
					Status: {
						type: String,
					},
				},
				Body: {
					Dimensions: {
						type: String,
					},
					Weight: {
						type: String,
					},
					SIM: {
						type: String,
					},
				},
				Display: {
					Type: {
						type: String,
					},
					Size: {
						type: String,
					},
					Resolution: {
						type: String,
					},
				},
				Platform: {
					OS: {
						type: String,
					},
					Chipset: {
						type: String,
					},
					CPU: {
						type: String,
					},
					GPU: {
						type: String,
					},
				},
				Memory: {
					Card_slot: {
						type: String,
					},
					Internal: {
						type: String,
					},
				},
				Main_Camera: {
					Single: {
						type: String,
					},
					Features: {
						type: String,
					},
					Video: {
						type: String,
					},
				},
				Selfie_camera: {
					Single: {
						type: String,
					},
					Video: {
						type: String,
					},
				},
				Sound: {
					Loudspeaker: {
						type: String,
					},
					jack: {
						type: String,
					},
				},
				Comms: {
					WLAN: {
						type: String,
					},
					Bluetooth: {
						type: String,
					},

					GPS: {
						type: String,
					},
					NFC: {
						type: String,
					},
					Radio: {
						type: String,
					},
					USB: {
						type: String,
					},
				},
				Features: {
					Sensors: {
						type: String,
					},
				},
				Battery: {
					Type: {
						type: String,
					},

					Talk_time: {
						type: String,
					},
				},
				Misc: {
					Colors: {
						type: String,
					},
					Price: {
						type: String,
					},
				},
			},
		},
	},
	{ timestamps: true }
);

const gsmarenaModal = new mongoose.model('gsm_arenas', gsmarenaModelSchema);

module.exports = gsmarenaModal;
