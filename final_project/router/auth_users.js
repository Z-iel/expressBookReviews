const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.filter(user => user.username === username).length > 0;
};

const authenticatedUser = (username, password) => {
  return users.filter(user => user.username === username && user.password === password).length > 0;
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required!" });
  }

  if (isValid(username) && authenticatedUser(username, password)) {
      const accessToken = jwt.sign(
        { username }, 
        { password }, 
        { expiresIn: '1h' }
      );
      return res.status(200).json({ message: "Successfully logged in!", accessToken });
  } else {
      return res.status(401).json({ message: "Invalid username or password!" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { username, review } = req.body;

  if (!isValid(username)) {
      return res.status(401).json({ message: "User not authorized" });
  }

  const book = books[isbn];
  if (book) {
      if (!book.reviews) {
          book.reviews = {};
      }
      book.reviews[username] = review; 
      return res.status(200).json({ message: "Review added/updated successfully!", reviews: book.reviews });
  } else {
      return res.status(404).json({ message: "ISBN not found!" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
