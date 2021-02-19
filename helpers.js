const getUserByEmail = (email, usersDb) => {
  const keys = Object.keys(usersDb);

  for (const key of keys) {
    if(usersDb[key].email === email) {
      const user = usersDb[key].id;
      return user;
    }
  }
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

module.exports = {
  getUserByEmail,
  generateRandomString,
};