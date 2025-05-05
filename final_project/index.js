const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const { isValid } = require("./router/auth_users.js");
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 86400, path: "/", httpOnly: true, secure: false },
    })
);

app.use("/customer/auth/*", function auth(req, res, next) {
    let user;

    if (req.session.user_token) {
        user = jwt.verify(req.session.user_token, "SECRET_PASSWORD");
    } else if (req.header("Authorization")) {
        let token = req.header("Authorization").split(" ")[1].trim();
        user = jwt.verify(token, "SECRET_PASSWORD");
    }
    if (user && isValid(user.username)) {
        req.user = user.username;
        return next();
    }
    return res.status(401).json({ message: "Login required" });
});

const PORT = 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
