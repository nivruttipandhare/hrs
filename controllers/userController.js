// controllers/userController.js
exports.register = (req, res) => {
  console.log("Registering user");
  res.send("User registered");
};
// for login purpose

exports.login = (req, res) => {
  console.log("Logging in user");
  res.send("User logged in");
};
