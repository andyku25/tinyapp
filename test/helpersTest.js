const { assert } = require("chai");
const { getUserByEmail, validateNewUser, validateLogin, urlsForUser }  = require("../helpers");

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrls = {
  "urlID1": { longURL: "http://lighthouselab.ca", userID: "userRandomID"},
  "urlID2": { longURL: "http://reddit.com", userID: "userRandom2ID"}
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
  it('should returns undefined with invalid email', function() {
    const user = getUserByEmail("doesnotexist@example.com", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.isUndefined(user, expectedOutput);
  });
});

describe("urlsForUser", () => {
  it("should return users object", () => {
    const urls = urlsForUser("userRandom2ID", testUrls);
    const expectedOutput = { "urlID2": { longURL: "http://reddit.com", userID: "userRandom2ID" }};
    assert.deepEqual(urls, expectedOutput);
  });
  it("should return an empty object when the userID has no urls in database", () => {
    const urls = urlsForUser("emptyUserID", testUrls);
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});