const isEmpty = require('lodash/isEmpty');
const mongoose = require('mongoose');
const { roomModel, friendModel } = require('../../models');

const approveFriendTransaction = async (friendId) => {
  const session = await friendModel.startSession();
  await session.startTransaction();
  console.log(1);

  try {
    const friendRecord = await friendModel.findOne({ _id: friendId }).session(session);

    if(isEmpty(friendRecord)) {
      throw new Error('不存在');
    }

    if(friendRecord.status !== 1) {
      throw new Error('狀態錯誤');
    }

    friendRecord.status = 2;
    await friendRecord.save();
    const room = await roomModel.create([{
      name: 'room',
      creator: friendRecord.creator,
      users: friendRecord.users,
      status: 1,
      type: 0,
    }], { session });

    await session.commitTransaction();

    return {
      room,
      friend: friendRecord,
    };
  } catch (error) {
    console.log('approveFriendTransaction -> error', error)
    await session.abortTransaction();
    throw error;
  } finally {
    console.log('approveFriendTransaction -> finally')
    session.endSession();
  }
}

module.exports.approveFriendTransaction = approveFriendTransaction;
