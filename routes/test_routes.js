const express = require("express");
const router = express.Router();

require("../src/database/connection");
const testModal = require("../src/database/modals/test_modal");

router.get("/test", async (req, res) => {
  try {
    const getUser = await testModal.find();
    res.status(200).json({ message: "Users found", getUser });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/test/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    const getUser = await testModal.findById(userID);

    if (!getUser) {
      res.status(404).json({ message: "User not found" });
      return;
    } else {
      res.status(200).json({ message: "User found", getUser });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/test" , async (req, res) => {
  const user = new testModal(req.body);
  console.log(req.body);

  try {
    const createUser = await user.save();
    res.status(201).json({ message: "User created successfully", createUser });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.patch("/test/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    const userData = req.body;
    const updateUser = await testModal.findByIdAndUpdate(userID, userData, {
      new: true,
    });
    if (!updateUser) {
      res.status(404).json({ message: "User not found" });
      return;
    } else {
      res
        .status(200)
        .json({ message: "User updated successfully", updateUser });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete("/test/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    const deleteUser = await testModal.findByIdAndDelete(userID);
    if (!deleteUser) {
      res.status(404).json({ message: "User not found" });
      return;
    } else {
      res
        .status(200)
        .json({ message: "User deleted successfully", deleteUser });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
