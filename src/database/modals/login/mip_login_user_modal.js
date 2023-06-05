const mongoose = require('mongoose');

const MIPLoginSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 40,
		},
		password: {
			type: String,
			required: true,
			minLength: 3,
		},
	},
	{ timestamps: true }
);

const MIPLoginModal = new mongoose.model('mpi_login_creds', MIPLoginSchema);

module.exports = MIPLoginModal;
