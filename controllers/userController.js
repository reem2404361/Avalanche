const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, buildingInfo } = req.body;
    const fields = {};
    if (name)         fields.name         = name;
    if (phone)        fields.phone        = phone;
    if (location)     fields.location     = location;
    if (buildingInfo) fields.buildingInfo = buildingInfo;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fields,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers };