const connection = require("../db/connection");
const AppointmentModel = require("../models/AppointmentModel");
const UserInfo = require("../models/UserModel");
const ExaminerController = {};

ExaminerController.examiner_page = (req, res) => {
  res.render("examiner/examiner", {
    title: "Examiner",
  });
};

ExaminerController.result_confirmation = (req, res) => {
  res.render("examiner/result_confirmation", {
    title: "Result",
  });
};

ExaminerController.DriverDetailExaminer = (req, res) => {
  const requestedId = req.params.driverId;
  SearchByDriverNumber(requestedId, res);
};

ExaminerController.GetAvailableTests = (req, res) => {
  connection();
  GetExistingTests(req.body["TestType"], res, req);
};

ExaminerController.SaveEvaluation = (req, res) => {
  connection();
  const resultStatus = parseInt(req.body["txtResult"]);
  const ExamType = req.body["txtExamType"];
  const resultComment = req.body["txtComment"];
  const _id = req.body["txtDriverId"];

  let userFields = {
    resultComment: resultComment,
    _id: _id,
    resultStatus: resultStatus == 1 ? "Approved" : "Fail",
    ExamType: ExamType,
  };

  SaveResults(userFields, res, req);
};

const SearchByDriverNumber = async (driverId, res) => {
  UserInfo.findOne({ _id: driverId }).then(function (doc) {
    if (!doc) {
      res.render("examiner/examiner", { title: "Examiner" });
      res.end();
    }

    res.render("examiner/driver_detail", {
      title: "Driver Detail",
      success: doc,
    });
    res.end();
  });
};

const GetExistingTests = async (testType, res, req) => {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let today = year + "-" + month + "-" + date;

  if (testType == "All") {
    UserInfo.find(
      {
        userType: "Driver",
        $or: [
          {
            $and: [
              { "timeSlot.GExam.slotDate": today },
              { "timeSlot.GExam.resultStatus": "" },
            ],
          },
          {
            $and: [
              { "timeSlot.G2Exam.slotDate": today },
              { "timeSlot.G2Exam.resultStatus": "" },
            ],
          },
        ],
      },
      function (err, docs) {
        res.json(docs);
      }
    );
  } else {
    UserInfo.find(
      {
        userType: "Driver",
        $or: [
          {
            $and: [
              { "timeSlot.GExam.slotDate": today },
              { "timeSlot.GExam.resultStatus": "" },
            ],
          },
          {
            $and: [
              { "timeSlot.G2Exam.slotDate": today },
              { "timeSlot.G2Exam.resultStatus": "" },
            ],
          },
        ],
        TestType: testType,
      },
      function (err, docs) {
        res.json(docs);
      }
    );
  }
};

const SaveResults = async (userFields, res, req) => {
  console.log(userFields.ExamType);
  
  if (userFields.ExamType == "G") {
      const filter = { _id: userFields._id };
      let doc = await UserInfo.findOne({ _id: userFields._id });
      doc.timeSlot.GExam.resultStatus = userFields.resultStatus;
      doc.timeSlot.GExam.resultComment = userFields.resultComment;
      await doc.save();
      res.render("examiner/result_confirmation", { title: "Driver Result" });
  } else {
    const filter = { _id: userFields._id };
    let doc = await UserInfo.findOne({ _id: userFields._id });
    doc.timeSlot.G2Exam.resultStatus = userFields.resultStatus;
    doc.timeSlot.G2Exam.resultComment = userFields.resultComment;
    await doc.save();
    res.render("examiner/result_confirmation", { title: "Driver Result" });
  }
};

module.exports = ExaminerController;
