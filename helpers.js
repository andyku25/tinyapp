const bcrypt = require("bcrypt");

const getUserByEmail = (email, usersDb) => {
  const keys = Object.keys(usersDb);

  for (const key of keys) {
    if (usersDb[key].email === email) {
      const user = usersDb[key].id;
      return user;
    }
  }
};

const validateNewUser = (email, password, userDb) => {
  const id = generateRandomString();

  // If any field is blank, return error msg.
  if (email === "") {
    return { id: null, error: "email field was blank" };
  } else if (password === "") {
    return { id: null, error: "password field was blank" };
  }

  // Check if user email already exists
  const newUser = getUserByEmail(email, userDb);

  if (!newUser) {
    return {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    };
  } else {
    return { id: null, error: "User Email already exists"};
  }
};

// Check if login credentials are validateUser. returns object { user_id, errorMsg }
const validateLogin = (email, password, usersDb) => {
  const userID = getUserByEmail(email, usersDb);
  const user = usersDb[userID];
  
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      return { id: user.id, email: user.email, password: user.password };
    }
    return { id: null, error: "Incorrect password. Please check your password and try again." };
  }
  return { id: null, error: "Email not found. Please try again with a different email" };
};

// radix base 36 to genetate a userID
const generateRandomString = () => {
  let output = "";
  for (let i = 0; i < 6; i++) {
    let randomChar = Math.floor(Math.random() * 1000) % 36;
    if (randomChar < 10) {
      output += randomChar.toString(36);
    } else {
      output += Math.round((Math.random() * 10)) % 2 === 0 ? randomChar.toString(36).toUpperCase() : randomChar.toString(36);
    }
  }
  return output;
};

const urlsForUser = (id, urlDb) => {
  const usersUrlDb = {};
  const keys = Object.keys(urlDb);
  for (const key of keys) {
    if (urlDb[key].userID === id) {
      usersUrlDb[key] = urlDb[key];
    }
  }
  return usersUrlDb;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  validateNewUser,
  validateLogin,
  urlsForUser
};