const { model, Schema } = require("mongoose");

const UserInfo = new Schema({
  userName: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String },
  userType: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  licenseNumber: { type: String },
  age: { type: String },
  TestType: { type: String },
  carDetail: {
    make: { type: String },
    model: { type: String },
    year: { type: String },
    plateNumber: { type: String },
  },
  timeSlot: {
    G2Exam: {
      slotDate: { type: String },
      slotId: { type: String },
      slotTime: { type: String },
      TestType: { type: String },
      resultStatus: { type: String },
      resultComment: { type: String },
    },
    GExam: {
      slotDate: { type: String },
      slotId: { type: String },
      slotTime: { type: String },
      TestType: { type: String },
      resultStatus: { type: String },
      resultComment: { type: String },
    }
  },
});

module.exports = model("UserInfo", UserInfo);
