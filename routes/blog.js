const { Router } = require("express");
const Blog = require("../models/blog");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const Comment = require("../models/comment");

const router = Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "blogify_uploads",
        allowed_formats: ["jpeg", "jpg", "png", "webp"],
    },
});

const upload = multer({ storage });

router.get("/add-new", (req, res) => {
    return res.render("addBlog", {
        user: req.user,
    });
});

router.get("/:id", async(req, res) => {
    const blog = await Blog.findById( req.params.id ).populate("createdBy");
    const allcomments = await Comment.find({ blogId: req.params.id }).populate("createdBy");

    if (!blog) return;
    return res.render("blog", {
        user: req.user,
        blog,
        comments: allcomments,
    })
})

router.post("/comment/:blogId", async(req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async(req, res) => {
    const { title, body } = req.body;
    const blog = await Blog.create({
        title,
        body,
        coverImageURL: req.file.path,
        createdBy: req.user._id,
    })
    return res.redirect(`/blog/${blog._id}`);
}); 


module.exports = router;