const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false
}));

let users = require("./users.json");

function saveUsers() {
    fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
}

// Middleware: check login
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect("/login");
}

// Routes
app.get('/mechanical', (req, res) => {
  res.render('mechanical');   // ← this should match your mechanical.ejs filename
});
app.get('/mech-pump', (req, res) => {
  res.render('mech-pump');   // ← this should match your mechanical.ejs filename
});








app.get('/electrical', (req, res) => {
  res.render('electrical');
});

app.get('/instrument', (req, res) => {
  res.render('instrument');
});


app.get("/", (req, res) => {
    if (req.session.user) res.redirect("/home");
    else res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        req.session.user = user;
        res.redirect("/home");
    } else {
        res.render("login", { error: "Invalid email or password" });
    }
});

app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

app.post("/register", (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
        res.render("register", { error: "User already exists" });
    } else {
        users.push({ email, password });
        saveUsers();
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

app.get("/home", isAuthenticated, (req, res) => {
    res.render("home", { user: req.session.user });
});

app.get("/equipment/:type", isAuthenticated, (req, res) => {
    const type = req.params.type;
    const filePath = path.join(__dirname, "data", `${type}.json`);
    if (!fs.existsSync(filePath)) return res.send("No data found");
    const data = JSON.parse(fs.readFileSync(filePath));
    res.render("equipment", { type, data });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
