const connection = require("../db/connection");
const AppointmentModel = require("../models/AppointmentModel");
const UserInfo = require("../models/UserModel");

const AppointmentController = {};

AppointmentController.GetSlotAvailable = (req, res) => {
  connection();
  GetExistingSlots(req.body["InputDate"], res, req);
};

AppointmentController.CandidatesResult = (req, res) => {
  connection();

  GetCandidatesResult(res, req);
};

AppointmentController.GetSlotAvailableForDriver = (req, res) => {
  connection();
  GetExistingSlotsForDrivers(req.body["InputDate"], res, req);
};

AppointmentController.slot_confirmation = (req, res) => {
  res.render("admin/admin_appointment_confirmation", {
    title: "Appointment Confirmation",
  });
};

AppointmentController.Appointment = (req, res) => {
  res.render("admin/admin_appointments", {
    title: "Appointment",
  });
};

AppointmentController.NewSlot = async (req, res) => {
  connection();
  var appointmentDate = req.body["txtDate"];

  var slots = [];
  for (var key in req.body) {
    if (JSON.parse(JSON.stringify(req.body)).hasOwnProperty(key)) {
      if (key == "txtDate") {
        continue;
      }
      item = req.body[key];
      slots.push({
        AppointmentDate: appointmentDate,
        Time: item,
        IsTimeSlotAvailable: true,
      });
    }
  }
  await CreateSlot(slots, res, req);
};

const CreateSlot = async (appoitmentFields, res, req) => {
  AppointmentModel.insertMany(appoitmentFields)
    .then(function () {
      res.redirect("/slot_confirmation");
      res.end();
    })
    .catch(function (error) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.write("Awww.. Don't Cry. It's just a 404 error.\n");
      res.end();
    });
};

const GetExistingSlots = async (appoitmentDate, res, req) => {
  AppointmentModel.find(
    { AppointmentDate: appoitmentDate },
    function (err, docs) {
      const hourSlots = generateTimeSlots("8:00", "13:30", 30).map(function (
        mm
      ) {
        return {
          Slot: mm,
          Available: true,
        };
      });

      docs.forEach((element) => {
        if (hourSlots.find((x) => x.Slot === element.Time)) {
          hourSlots.find((x) => x.Slot === element.Time).Available = false;
        }
      });

      res.json(hourSlots);
    }
  );
};

const GetExistingSlotsForDrivers = async (appoitmentDate, res, req) => {
  AppointmentModel.find(
    { AppointmentDate: appoitmentDate, IsTimeSlotAvailable: true },
    function (err, docs) {
      res.json(docs);
    }
  );
};

const GetCandidatesResult = async (res, req) => {
  UserInfo.find({ userType: "Driver", resultStatus: {$ne:null} }, function (err, docs) {
    res.render("admin/admin_candidates_list", {
      title: "Pass || Fail Candidates", 
      success: docs
    });
  });
};

/* Extra code */

const timeStringToMinutes = (timeStr, separator) =>
  timeStr.split(separator).reduce((h, m) => h * 60 + +m);

const minutesToTimeString = (minutes, separator) => {
  const minutesPart = (minutes % 60).toString().padStart(2, "0");
  const hoursPart = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  return hoursPart + separator + minutesPart;
};

function generateTimeSlots(startStr, endStr, periodInMinutes, separator = ":") {
  let startMinutes = timeStringToMinutes(startStr, separator);
  let endMinutes = timeStringToMinutes(endStr, separator);
  const oneDayInMinutes = 1440;
  if (endMinutes >= oneDayInMinutes) endMinutes = oneDayInMinutes - 1;
  if (startMinutes <= 0) startMinutes = 0;

  return Array.from(
    { length: Math.floor((endMinutes - startMinutes) / periodInMinutes) + 1 },
    (_, i) => minutesToTimeString(startMinutes + i * periodInMinutes, separator)
  );
}

module.exports = AppointmentController;
