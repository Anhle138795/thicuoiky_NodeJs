const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({ secret: "your-secret-key", resave: true, saveUninitialized: true })
);

mongoose.connect(
  "mongodb+srv://ank138795:123@cluster0.mddxbxf.mongodb.net/student-management",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB successfully!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const Student = require("./models/Student");
const User = require("./models/User");

// ... (Phần code kết nối MongoDB)

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  console.log("User:", user); // Kiểm tra thông tin người dùng được trả về

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user;
    console.log("Session user:", req.session.user); // Kiểm tra session sau khi đăng nhập
    res.redirect("/dashboard");
  } else {
    console.log("Login failed!");
    res.redirect("/");
  }
});


app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
  });

  await newUser.save();
  res.redirect("/login");
});

app.get("/dashboard", async (req, res) => {
  try {
    if (req.session.user) {
      // Lấy danh sách sinh viên từ MongoDB
      const students = await Student.find();

      // Render trang dashboard và truyền danh sách sinh viên vào
      res.render("dashboard", { user: req.session.user, students });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});


app.post("/addStudent", async (req, res) => {
  try {
    const { id, name, address, phoneNumber, age, grade } = req.body;

    // Tạo một đối tượng sinh viên mới
    const newStudent = new Student({
      id,
      name,
      address,
      phoneNumber,
      age,
      grade,
    });

    // Lưu sinh viên mới vào MongoDB
    await newStudent.save();

    // Redirect lại trang students sau khi thêm thành công
    res.redirect("/students");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


app.js
app.get("/students", async (req, res) => {
  try {
    // Lấy danh sách sinh viên từ MongoDB
    const students = await Student.find();

    // Render trang students và truyền danh sách sinh viên vào
    res.render("students", { students });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error" + error.message);
  }
});