const bcrypt = require("bcrypt");

// Check email account if they already exist list
const validateRegistration = (email, password, usersDb) => {
  if (email === "") {
    return { email: null, error: "email" };
  } else if (password === "") {
    return { email: null, error: "password" };
  }

  let keys = Object.keys(usersDb);
  for (const key of keys) {
    if (usersDb[key].email === email) {
      return { email: "duplicate", error: "email" };
    }
  }
  return { email: email, error: null };
};

// Check if login credentials are validateUser. returns object { user_id, errorMsg }
const validateLogin = (email, password, usersDb) => {
  let keys = Object.keys(usersDb);
  for (const key of keys) {
    if (usersDb[key].email === email) {
      console.log(usersDb[key])
      const currentUser = usersDb[key].id;
      // if (usersDb[key].password === password) {
      if (bcrypt.compareSync(password, usersDb[key].password)) {
        return { userID: currentUser, error:null };
      }
      return { userID: null, error: "password" };
    }
  }
  return { userID: null, error: "email"};
};

module.exports = {
  validateRegistration,
  validateLogin
};