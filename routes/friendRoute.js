const express = require('express');
const { friendModel } = require('../models');
const isEmpty = require('lodash/isEmpty');  
const { approveFriendTransaction } = require('../helpers/transactions');
const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.user._id;
  const friends = await friendModel
    .find({users: {$in: [userId]}})
    .populate({path: "users", select: "account name avatar"})
    .populate({path: "creator", select: "account name avatar"});
  console.log("friends", friends)
  
  res.status(200).json({
    success: true,
    data: {
      friends
    }
  })
});

router.post('/approve/:friendId', async (req, res) => {
  const { friendId } = req.params;
  try {
    const result = await approveFriendTransaction(friendId);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch(error) {
    return res.status(500).json({
      success: false,
      data: { message: error.message}
    });
  }
});

router.post('/reject/:friendId', async (req, res) => {
  const { friendId } = req.params;
  try {
    const oldRecord = await friendModel.findById(friendId);
    if (isEmpty(oldRecord) || oldRecord.status !== 1) {
      return res.status(500).json({ success: false, data: { message: '狀態錯誤' } });
    }

    oldRecord.status = 0;
    const result = await oldRecord.save();

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: { message: error.message}
    });
  }
});

router.post('/invite/:userId', async (req, res) => {
  const { userId } = req.params;
  const creator = req.user._id;
  const users = [userId, creator];

  const oldRecord = await friendModel.findOne({ users });

  if (isEmpty(oldRecord)) {
    const friend = await friendModel.create({
      users,
      creator,
      status: 1
    });

    return res.status(200).json({
      success: true,
      data: friend
    });
  }

  if (oldRecord.status === 0) {
    oldRecord.status = 1;
    const result = await oldRecord.save();

    return res.status(200).json({
      success: true,
      data: result
    });
  }

  return res.status(500).json({
    success: false,
    data: { message: '狀態錯誤' }
  });
});

module.exports = router;
