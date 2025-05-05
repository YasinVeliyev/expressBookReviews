const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const fs = require("node:fs");

let users = [];
if (fs.existsSync("./users.json")) {
    users = JSON.parse(fs.readFileSync("./users.json"));
} else {
    fs.writeFileSync("./users.json", "[]");
}

const isValid = (username) => {
    return Boolean(users.find((user) => user.username === username));
};

const authenticatedUser = (username, password) => {
    //returns boolean
    //write code to check if username and password match the one we have in records.
    return Boolean(users.find((user) => user.username === username && user.password === password));
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    let { username, password } = req.body;
    username = username.trim().toLowerCase();
    if (authenticatedUser(username, password)) {
        let token = jwt.sign({ username }, "SECRET_PASSWORD");
        req.session.user_token = token;
        return res.status(200).json({ token });
    }
    return res.status(401).json({ message: "Username or Password is wrong" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let book = books[req.params.isbn];
    let { review } = req.body;
    if (book) {
        book[req.user] = review;
        return res.status(200).json({ message: "Review added" });
    }
    return res.status(404).json({ message: "Book not found" });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let book = books[req.params.isbn];
    if (book) {
        delete book.reviews[req.user];
        return res.status(204).end();
    }
    return res.status(404).json({ message: "Book not found" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
