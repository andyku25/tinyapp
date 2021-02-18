const PORT = 8080;

const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcrypt");
const { generateRandomString, validateRegistration, validateLogin } = require("./helpers/userAuth");
// const urlsForUser = require("./helpers/urlsForUser");


const testDbPw = "qwerty";
const testHashedPw = bcrypt.hashSync(testDbPw, 10);

const app = express();

// Tells express to use ejs as its templating language/ configurations
app.set("view engine", "ejs");

// "DATABASES"
const urlDatabase = {
  "b2xVn2": { longURL: "http://lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://google.com", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": { id: "aJ48lW", email:"test@test.com", password: testHashedPw } 
};


// Converts all buffer data into sting in human readable form
app.use(bodyParser.urlencoded({extended: true})); // before all routes
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['7f69fa85-caec-4xcc-acd7-eeb2ccb368d5', 's13b4b3m-41c8-47d3-93f6-8836do3cd8eb']
}))


// Create middleware function
const getCurrentUser = (req, res, next) => {
  console.log(req)
  const userID = req.session["userID"];
  const loggedInUser = users[userID];
  req.currentUser = loggedInUser;
  next();
};

// DO NOT USE THIS - req is not defined
// app.use(getCurrentUser());

// root/home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Register get handler
app.get("/register", (req, res) => {
  const templateVars = {
    userID: req.session["userID"],
    users
  };
  res.render("register", templateVars);
});

// Register Post handler
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const emailCheck = validateRegistration(email, password, users);  

  // check new user details
  if (!emailCheck.email) {
    res.status(400).send(`Error 400: ${emailCheck.error} field was blank`);
  } else if (emailCheck.email === "duplicate") {
    res.status(400).send(`Error 400: ${emailCheck.error} has already been registered.`);
  } else {
    users[id] = {
      id,
      email,
      password: hashedPassword
    };
    
    console.log(users);
    res.session.userID = users[id].id;
    res.redirect("/urls");
  }
});

// LOGIN GET handler
app.get("/login", (req, res) => {
  const templateVars = {
    userID: req.session["userID"],
    users
  };
  res.render("login", templateVars);
});

// LOGIN POST handler
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const currentUser = validateLogin(email, password, users);

  console.log(currentUser);
  if (!currentUser.userID) {
    res.status(403).send(`There was an error with your ${currentUser.error}`);
  } else {
    req.session.userID = currentUser.userID;
    res.redirect("/urls");
  }
});

// LOGOUT POST handler
app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});

// Display the URLS
app.get("/urls", (req, res) => {
  const userID = req.session["userID"];
  const templateVars = {
    userID,
    users,
    urls: urlDatabase,
  };
  if (!userID) {
    
  } else {
    const usersUrls = urlsForUser(userID)
    console.log(usersUrls);
    templateVars.urls = usersUrls;
  };
  res.render("urls_index", templateVars);
});

// Create new TinyURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userID: req.session["userID"],
    users
  };
  res.render("urls_new", templateVars);
});

// POST handler for urls/
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session["userID"] };
  res.redirect(`/urls`);
});

// View the selected short URL details
app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.session["userID"];
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === currentUser) {
    const templateVars = {
      userID: currentUser,
      users,
      urls: urlDatabase,
      shortURL,
      longURL: urlDatabase[shortURL],
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// UPDATE the short URL details
app.post("/urls/:shortURL", (req, res) => {
  const currentUser = req.session["userID"];
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL].userID === currentUser) {
    urlDatabase[shortURL] =  { longURL:req.body.longURL, userID:req.session["userID"] };
  }
  console.log(urlDatabase);
  res.redirect("/urls");
});


// DELETE btn post method redirect to index page "/urls"
app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = req.session["userID"];
  console.log(currentUser);
  if (urlDatabase[req.params.shortURL].userID === currentUser) {
    delete urlDatabase[req.params.shortURL];
  }
  console.log(urlDatabase)
  res.redirect("/urls");
});


// View the selected short URL details
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.status(404);
    return res.render("error404");
  } else {
    res.redirect(longURL);
  }
});

// TEST CODE?
// // View JSON details from the "url database"
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// // Hello view test code
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// ERROR 404 Handler
app.use((req, res, next) => {
  templateVars = {
    userID: req.session.userID,
    users
  }
  res.status(404).render("error404", templateVars);
});

// Activate server to listen for requests
app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});


const urlsForUser = (id) => {
  const usersUrlDb = {};
  const keys = Object.keys(urlDatabase);
  for (const key of keys) {      
    console.log(key);
    if (urlDatabase[key].userID === id) {
      usersUrlDb[key] = urlDatabase[key];
    }
  }
  return usersUrlDb;
};