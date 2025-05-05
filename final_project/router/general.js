const express = require("express");

const books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const fs = require("node:fs");

public_users.post("/register", (req, res) => {
    let { username, password } = req.body;
    username = username.trim().toLowerCase();
    password = password.trim();

    let errors = {};
    if (!username.length > 2) {
        errors.username = "Username length must be at least 3";
    }
    if (password.length < 8) {
        errors.password = "Password length must be at least 8";
    }

    if (isValid(username)) {
        errors.username = "Username already taken";
    }
    if (errors.username || errors.password) {
        return res.status(401).json(errors);
    } else {
        users.push({ username, password });
        fs.writeFile("./users.json", JSON.stringify(users), (err) => {
            if (err) {
                return res.status(500).json({ message: "Unexpected error" });
            }
            return res.status(200).json({ username });
        });
    }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
    new Promise((resolve, reject) => {
        if (Object.keys(books).length > 0) {
            resolve(books);
        } else {
            reject("Books not found");
        }
    })
        .then((books) => res.status(200).json(books))
        .catch((err) => {
            console.error(err);
            res.status(500).json(err);
        });
    // return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
    new Promise((resolve, reject) => {
        if (Object.keys(books).length > 0) {
            let book = books[req.params.isbn];
            if (book) {
                resolve(book);
            } else {
                reject(["Book Not found", 404]);
            }
        } else {
            reject(["Server error", 500]);
        }
    })
        .then((book) => res.status(200).json(book))
        .catch((err) => {
            console.error(err);
            res.status(err[1]).json(err[0]);
        });

    // if (book) {
    //     return res.status(200).json(book);
    // }
    // return res.status(404).json({ message: "Not Found" });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
    new Promise((resolve, reject) => {
        if (Object.keys(books).length > 0) {
            let books_by_author = Object.values(books).filter(
                (book) => book.author.trim().toLowerCase() == req.params.author.trim().toLowerCase()
            );
            if (books_by_author.length) {
                resolve(books_by_author);
            } else {
                reject(["Books Not found", 404]);
            }
        } else {
            reject(["Server error", 500]);
        }
    })
        .then((books) => res.status(200).json(books))
        .catch((err) => {
            console.error(err);
            res.status(err[1]).json(err[0]);
        });
    // let books_author = Object.values(books).filter(
    //     (book) => book.author.trim().toLowerCase() == req.params.author.trim().toLowerCase()
    // );
    // if (books_author.length) {
    //     return res.status(200).json(books_author);
    // }
    // return res.status(404).json({ message: "Not Found" });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
    // let book_by_title = Object.values(books).filter(
    //     (book) => book.title.trim().toLowerCase() == req.params.title.trim().toLowerCase()
    // );
    // if (book_by_title.length) {
    //     return res.status(200).json(book_by_title);
    // }
    // return res.status(404).json({ message: "Not Found" });

    new Promise((resolve, reject) => {
        if (Object.keys(books).length > 0) {
            let book_by_title = Object.values(books).find(
                (book) => book.title.trim().toLowerCase() == req.params.title.trim().toLowerCase()
            );
            if (book_by_title) {
                resolve(book_by_title);
            } else {
                reject(["Book Not found", 404]);
            }
        } else {
            reject(["Server error", 500]);
        }
    })
        .then((books) => res.status(200).json(books))
        .catch((err) => {
            console.error(err);
            res.status(err[1]).json(err[0]);
        });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
    let book = books[req.params.isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    }
    return res.status(404).json({ message: "Not Found" });
});

module.exports.general = public_users;
