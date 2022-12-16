const connection = require("../db/connection");
const UserInfo = require("../models/UserModel");
const bcrypt = require("bcrypt");

const UserController = {};

UserController.login = (req, res) => {
  res.render("login", { title: "Login or Sign Up | DriveTest Booking Kiosk" });
};

UserController.loginIn = async (req, res) => {
  connection();

  let userFields = {
    userName: req.body["txtUser"],
    password: req.body["txtPassword"],
  };

  await LoginIn(userFields, res, req);
};

UserController.Logout = async (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};

UserController.sign_up = async (req, res) => {
  connection();

  const userName = req.body["txtUserName"];
  const password = req.body["txtPassword"];
  const confirmPassword = req.body["txtConfirmPassword"];
  const userType = req.body["txtUserType"];

  const hash = await bcrypt.hash(password, 10);
  const result = await bcrypt.compare(confirmPassword, hash);

  if (result) {
    let userFields = {
      userName: userName,
      password: hash,
      userType: userType,
    };
    await SignUp(userFields, res, req);
  } else {
    res.render("login", {
      title: "Login or Sign Up | DriveTest Booking Kiosk",
      error: "Password does not match.",
    });
  }
};

const LoginIn = async (fields, res, req) => {
  UserInfo.findOne({
    userName: fields.userName,
  }).then(function (doc) {
    if (!doc) {
      res.render("login", {
        title: "User Not Found | DriveTest Booking Kiosk",
        error: "User not found.",
      });
      res.end();
    } else {
      const mongooseUserPassword = doc.password;
      const passwordValidation = bcrypt.compare(
        fields.password,
        mongooseUserPassword
      );
      passwordValidation.then(function (result) {
        if (result) {
          req.session.user = doc;
          req.session.authorized = true;
          req.session.save();

          res.redirect("g_page");
          res.end();
        } else {
          res.render("login", {
            title: "Login or Sign Up | DriveTest Booking Kiosk",
            error: "Invalid email or password.",
          });
        }
      });
    }
  });
};

const SignUp = async (userFields, res, req) => {
  UserInfo.findOne({ userName: userFields.userName }).then(function (doc) {
    if (!doc) {
      const userInfo = new UserInfo({
        userName: userFields.userName,
        password: userFields.password,
        userType: userFields.userType,
        firstName: "",
        lastName: "",
        age: "",
        licenseNumber: "",
        carDetail: {
          make: "",
          model: "",
          year: "",
          plateNumber: "",
        },
        timeSlot: {
          G2Exam: {
            slotDate: "",
            slotId: "",
            slotTime: "",
            resultStatus: "",
            resultComment: "",
          },
          GExam: {
            slotDate: "",
            slotId: "",
            slotTime: "",
            resultStatus: "",
            resultComment: "",
          },
        },
      });

      userInfo.save((err, document) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.write("Awww.. Don't Cry. It's just a 404 error.\n");
          res.end();
        }
        req.session.user = document;
        req.session.authorized = true;
        req.session.save();
        res.redirect("/g2_page");
        res.end();
      });
    } else {
      res.render("login", {
        title: "Login or Sign Up | DriveTest Booking Kiosk",
        error: "User account already exists.",
      });
      res.end();
    }
  });
};

module.exports = UserController;
