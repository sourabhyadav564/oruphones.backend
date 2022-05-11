const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

main().catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect(process.env.MONGO, { useNewUrlParser: true });
        console.log("Connected to MongoDB Successfully");
    } catch (error) {
        console.log(error); 
    }
}