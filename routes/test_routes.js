const express = require("express");
const router = express.Router();
require("../src/database/connection");
const userModal = require("../src/database/modals/test_modal");

// router.get("/", async (req, res) => {
//   try {
//     const getUser = await userModal.find();
//     res.status(200).json({ message: "Users found", getUser });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json(err);
//   }
// });

// router.get("/:id", async (req, res) => {
//   try {
//     const userID = req.params.id;
//     const getUser = await userModal.findById(userID);

//     if (!getUser) {
//       res.status(404).json({ message: "User not found" });
//     } else {
//       res.status(200).json({ message: "User found", getUser });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(err);
//   }
// });

router.post("/test", async (req, res) => {
  const user = new userModal(req.body);
  console.log(req.body);

  // createUser.save().then(() => {
  //     res.status(201).json(createUser);
  // }).catch(err => {
  //     console.log(err);
  //     res.status(400).json(err);
  // })

  try {
    const createUser = await user.save();
    res.status(201).json({ message: "User created successfully", createUser });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

// router.patch("/:id", async (req, res) => {
//   try {
//     const userID = req.params.id;
//     const userData = req.body;
//     const updateUser = await userModal.findByIdAndUpdate(userID, userData, {
//       new: true,
//     });
//     if (!updateUser) {
//       res.status(404).json({ message: "User not found" });
//     } else {
//       res
//         .status(200)
//         .json({ message: "User updated successfully", updateUser });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(err);
//   }
// });

// router.delete("/:id", async (req, res) => {
//   try {
//     const userID = req.params.id;
//     const deleteUser = await userModal.findByIdAndDelete(userID);
//     if (!deleteUser) {
//       res.status(404).json({ message: "User not found" });
//     } else {
//       res
//         .status(200)
//         .json({ message: "User deleted successfully", deleteUser });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(err);
//   }
// });

module.exports = router;
