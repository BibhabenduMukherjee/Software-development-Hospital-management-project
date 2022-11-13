var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var db = require.main.require("./models/db_controller");
var mysql = require("mysql");
var nodemailer = require("nodemailer");
var randomToken = require("random-token");
const { check, validationResult } = require("express-validator");
const Custom = require("../service/Custom");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get("/", function (req, res) {
  res.render("signup.ejs");
});

router.post(
  "/",
  [
    check("username").notEmpty().withMessage("Username is required"),
    check("password").notEmpty().withMessage("Password is required"),
    check("email").notEmpty().isEmail().withMessage("Valid Email required"),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    var email_status = "not_verified";
    var email = req.body.email;
    var username = req.body.username;

    // db.checkIfpresent(email, function (err, result) {
    //   if (result[0].id != null) {
    //     next(Custom(500, "Email already taken").alreadyExists());
    //   }
    // });

    db.signup(
      req.body.username,
      req.body.email,
      req.body.password,
      email_status
    );

    var token = randomToken(8);

    // signup() - > it create a id and save in the database id , email, password
    // generate a token after that
    // id,email,token

    db.verify(req.body.username, email, token);

    // pull the id form verify table {username -> id}
    db.getuserid(email, function (err, result) {
      var id = result[0].id;
      var output =
        `
            <p>Hello  ` +
        username +
        `, </p>
            <p>Thanks for sign up. Your verification id and token is given below :  </p>
           
            <ul>
                <li>User ID: ` +
        id +
        `</li>
                <li>Token: ` +
        token +
        `</li>
            </ul>
            <p>verify Link: <a href="http://localhost:3000/verify">Verify</a></p>
            
            <p><strong>This is an automatically generated mail. Please do not reply back.</strong></p>
            
            <p>Regards,</p>
            <p>Mukherjee</p>
        `;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "medicocareteam@gmail.com",
          pass: "crebbjgrdxygstsw",
        },
      });

      var mailOptions = {
        from: "medicocareteam@gmail.com",
        to: email,
        subject: "Email Verification", // Subject line
        html: output, // plain text body
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          return console.log(err);
        }
        console.log(info);
      });

      res.send("Check you email for token to verify");
    });

    // res.redirect('login');
  }
);

module.exports = router;
