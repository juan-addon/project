const connection = require("../db/connection");
const UserInfo = require("../models/UserModel");
const AppointmentModel = require("../models/AppointmentModel");
const bcrypt = require("bcrypt");
const session = require("express-session");

const controller = {};

/* Page controller. We can also control the page titles here.*/
controller.index = (req, res) => {
  res.render("index", { title: "Home | DriveTest Booking Kiosk" });
};

controller.login = (req, res) => {
  res.render("login", { title: "Login or Sign up | DriveTest Booking Kiosk" });
};

controller.g2 = (req, res) => {
  res.render("g2_page", { title: "G2 Page | DriveTest Booking Kiosk" });
};

controller.g2_confirmation = (req, res) => {
  res.render("g2_confirmation", {
    title: "Exam Confirmation | DriveTest Booking Kiosk",
  });
};

controller.g = (req, res) => {
  res.render("g_page", { title: "G Page | DriveTest Booking Kiosk" });
};

/* End of page controller. */

/* Page action methods */
controller.g2_post = async (req, res) => {
  connection();

  const firstName = req.body["txtFirstName"];
  const lastName = req.body["txtLastName"];
  const licenseNumber = req.body["txtLicenseNumber"];
  const age = req.body["txtAge"];

  const make = req.body["txtMake"];
  const model = req.body["txtModel"];
  const year = req.body["txtYear"];
  const plateNumber = req.body["txtPlateNumber"];
  const slot = req.body["slot"];
  const slotDate = req.body["txtDate"];
  const userName = req.session.user.userName;

  let userFields = {
    userName: userName,
    firstName: firstName,
    lastName: lastName,
    licenseNumber: licenseNumber,
    age: age,
    carDetail: {
      make: make,
      model: model,
      year: year,
      plateNumber: plateNumber,
    },
    slot: {
      id: slot,
      slotDate: slotDate,
    },
  };
  await G2Register(userFields, res, req);
};

controller.g_page_confirm = async (req, res) => {
  connection();

  const make = req.body["txtMake"];
  const model = req.body["txtModel"];
  const year = req.body["txtYear"];
  const plateNumber = req.body["txtPlateNumber"];
  const userName = req.session.user.userName;
  const slot = req.body["slot"];
  const slotDate = req.body["txtDate"];

  let userFields = {
    userName: userName,
    carDetail: {
      make: make,
      model: model,
      year: year,
      plateNumber: plateNumber,
    },
    slot: {
      id: slot,
      slotDate: slotDate,
    },
  };

  await SearchAndUpdate(userFields, res, req);
};
/* End of the page action methods */

/* Start of the page functions */
const SearchAndUpdate = async (userFields, res, req) => {

  let appoitmnet = await AppointmentModel.findOne({ _id: userFields.slot.id });
  appoitmnet.IsTimeSlotAvailable = false;

  let doc = await UserInfo.findOne({ userName: userFields.userName });
  doc.TestType = "G";
  // Car Detail
  doc.carDetail.make = userFields.carDetail.make;
  doc.carDetail.model = userFields.carDetail.model;
  doc.carDetail.year = userFields.carDetail.year;
  doc.carDetail.plateNumber = userFields.carDetail.plateNumber;
  //TimeSlot
  doc.timeSlot.GExam.slotDate = userFields.slot.slotDate;
  doc.timeSlot.GExam.slotId = userFields.slot.id;
  doc.timeSlot.GExam.slotTime = appoitmnet.Time;

  await doc.save();
  await appoitmnet.save();
  
  req.session.user = await UserInfo.findOne({ userName: userFields.userName });;
  req.session.authorized = true;
  req.session.save();

  res.redirect("g2_confirmation");
  res.end();

};

const G2Register = async (userFields, res, req) => {

  let appoitmnet = await AppointmentModel.findOne({ _id: userFields.slot.id });
  appoitmnet.IsTimeSlotAvailable = false;

  let doc = await UserInfo.findOne({ userName: userFields.userName });
  doc.TestType = "G2";
  doc.firstName = userFields.firstName;
  doc.lastName = userFields.lastName;
  doc.licenseNumber = userFields.licenseNumber;
  doc.age = userFields.age;

  // Car Detail
  doc.carDetail.make = userFields.carDetail.make;
  doc.carDetail.model = userFields.carDetail.model;
  doc.carDetail.year = userFields.carDetail.year;
  doc.carDetail.plateNumber = userFields.carDetail.plateNumber;
  //TimeSlot
  doc.timeSlot.G2Exam.slotDate = userFields.slot.slotDate;
  doc.timeSlot.G2Exam.slotId = userFields.slot.id;
  doc.timeSlot.G2Exam.slotTime = appoitmnet.Time;

  await doc.save();
  await appoitmnet.save();
  
  req.session.user = await UserInfo.findOne({ userName: userFields.userName });;
  req.session.authorized = true;
  req.session.save();

  res.redirect("g2_confirmation");
  res.end();

};
/* End of the page function */

module.exports = controller;
