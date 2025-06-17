require("dotenv").config();

const express = require("express");
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { connectToMongoDb } = require("./connection");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");

const app = express();
const PORT = process.env.PORT || 8005;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

connectToMongoDb(process.env.MONGO_URL)
    .then(() => console.log("MongoDb connected"))
    .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
//app.use(express.static(path.resolve("./public"))); Since we use cloudinary

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.get("/", async(req, res) => {
    const allBlogs = await Blog.find({});
    return res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
})


app.listen(PORT, () => console.log("Server Started at PORT: ", PORT));
