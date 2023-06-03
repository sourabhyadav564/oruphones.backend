const express = require('express')
const router = express.Router()
const testModal = require('../../database/modals/others/test_modal')
const redis = require('../../../config/redis')

router.get('/test', async (req, res) => {

  try {
    const cachedValue = await redis.get('user') // Use `await` to wait for the Redis GET operation
    if (cachedValue) {
      res.status(200).json({ message: 'User found', cachedValue })
      return
    }

    const getUser = await testModal.find()
    await redis.set('user', JSON.stringify(getUser))

    res.status(200).json({ message: 'Users found', getUser })
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})


router.get('/test/:id', async (req, res) => {
  try {
    const userID = req.params.id
    const cachedValue = await redis.get(userID) // Check if the user data is cached

    if (cachedValue) {
      const user = JSON.parse(cachedValue)
      res.status(200).json({ message: 'User found', user })
      return
    }

    const user = await testModal.findById(userID)

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    await redis.set(userID, JSON.stringify(user)) // Cache the user data

    res.status(200).json({ message: 'User found', user })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.post('/test', async (req, res) => {
  const user = new testModal(req.body)

  try {
    const createUser = await user.save()
    res.status(201).json({ message: 'User created successfully', createUser })
    return
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

router.patch('/test/:id', async (req, res) => {
  try {
    const userID = req.params.id
    const userData = req.body
    const updateUser = await testModal.findByIdAndUpdate(userID, userData, {
      new: true,
    })
    if (!updateUser) {
      res.status(404).json({ message: 'User not found' })
      return
    } else {
      res.status(200).json({ message: 'User updated successfully', updateUser })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.delete('/test/:id', async (req, res) => {
  try {
    const userID = req.params.id
    const deleteUser = await testModal.findByIdAndDelete(userID)
    if (!deleteUser) {
      res.status(404).json({ message: 'User not found' })
      return
    } else {
      res.status(200).json({ message: 'User deleted successfully', deleteUser })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})


module.exports = router
