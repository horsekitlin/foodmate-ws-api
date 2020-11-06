const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const yup = require('yup');
const { eventModel } = require('../models');
const { getConditionByQuery } = require('../helpers/utils');

router.get('/', async (req, res) => {
  try {
    const { user } = req;
    const condition = getConditionByQuery(req.query);

    const events = await eventModel.findEvents({
      users: { $in: [user._id] },
      ...condition,
    })
    return res.status(200).json({
      success: true,
      data: { events },
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      data: { message: error.message },
    });
  }
});

const validateAlreadyJoin = (event, user) => {
  const result = event.users.find(u => u.id.toString() === user._id.toString());
  return Boolean(result);
};

router.post('/leave/:eventId', async (req, res) => {
  try {
    const { user } = req;
    const { eventId } = req.params;

    const event = await eventModel.findEventById(eventId);
    const alreadyJoin = validateAlreadyJoin(event, user);
    if (!alreadyJoin) {
      throw new Error('尚未加入活動');
    }

    await eventModel.update({ _id: eventId }, { $pull: { users: user._id } });
    const updatedEvent = await eventModel.findEventById(eventId);

    return res.status(200).json({
      success: true,
      data: { event: updatedEvent },
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      data: { message: error.message },
    });
  }
});

router.post('/:eventId', async (req, res) => {
  try {
    const { user } = req;
    const { eventId } = req.params;

    const event = await eventModel.findEventById(eventId);
    const alreadyJoin = validateAlreadyJoin(event, user);
    if (alreadyJoin) {
      throw new Error('已經加入活動');
    }

    await eventModel.update({ _id: eventId }, { $push: { users: user._id } });
    const updatedEvent = await eventModel.findEventById(eventId);

    return res.status(200).json({
      success: true,
      data: { event: updatedEvent },
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      data: { message: error.message },
    });
  }
});

const createEventSchema = yup.object().shape({
  title: yup.string().required('title 不可為空'),
  logo: yup.string().required("logo 不可為空"),
  publicationPlace: yup.string().required("publicationPlace 不可為空"),
  description: yup.string().required("description 不可為空"),
  meetingGeoJson: yup.object({
    type: yup.string().required("type 不可為空"),
    coordinates: yup.array().required('meetingGeoJson.coordinates 不可為空'),
  }).required("meetingGeoJson 不可為空"),
  type: yup.mixed().oneOf([0, 1, 2]),
  status: yup.mixed().oneOf([0, 1, 2]),
  paymentMethod: yup.mixed().oneOf([0, 1, 2]),
  budget: yup.number().positive('必須是正整數'),
  finalReviewAt: yup.date().required('finalReviewAt 不可為空'),
  datingAt: yup.date().required('datingAt 不可為空'),
});

router.post('/', async (req, res) => {
  try {
    const { user, body } = req;
    await createEventSchema.validate(body);
    const eventId = mongoose.Types.ObjectId();

    await new eventModel({
      ...body,
      _id: eventId,
      creator: user._id
    }).save();

    const result = await eventModel.findEventById(eventId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      data: { message: error.message },
    });
  }
});

module.exports = router;
