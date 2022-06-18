const express = require("express");
const router = express.Router();
const fs = require("fs");
const MIPLoginModal = require("../../src/database/modals/login/mip_login_user_modal");
const generateHash = require("../../utils/generate_hash");
var bcrypt = require("bcryptjs");

require("../../src/database/connection");

router.get("/validateUser", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const getUser = await MIPLoginModal.findOne({
      username: username,
    });

    if (!getUser) {
      res.status(404).json({ message: "User not found", code: 0 });
      return;
    } else {
      passwordCompare = bcrypt.compare(password, getUser.password);
      if (!passwordCompare) {
        res.status(404).json({ message: "Invalid login credentials", code: 0 });
        return;
      } else {
        res.status(200).json({ message: "User found", code: 1, getUser });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/createUser", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const hashedPassword = await generateHash(password);
    console.log("hashedPassword", hashedPassword);

    const getUser = await MIPLoginModal.findOne({ username: username });
    if (getUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    } else {
      const userDate = {
        username: username,
        password: hashedPassword,
      };
      const user = new MIPLoginModal(userDate);
      const createUser = await user.save();
      res
        .status(201)
        .json({ message: "MIP user created successfully", createUser });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
