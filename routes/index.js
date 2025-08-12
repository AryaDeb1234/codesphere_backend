// Import required modules
const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
// const isAuthenticated = require('../middlewares/isAuth');
const { uploadcloudinary } = require("../utlis/cloudinary");

const fs = require("fs");
var User = require("../models/user");
var Project = require("../models/project");

var passport = require("passport");
const isAuthenticated = passport.authenticate("jwt", { session: false });


/* ************************* FOR TESTING PURPOSE WITH EJS  ***************************************/
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/profile", function (req, res) {
  res.render("profile");
});

router.get("/search", (req, res) => {
  res.render("search"); // Renders search.ejs
});

router.get("/project/upload/:id", (req, res) => {
  const userId = req.params.id;
  res.render("project_form", { userId });
});
/********************************************************************************************* */




//SOB ONLINE POST PAYOAR JONNO (GLOBAL POST SECTION E)
router.get("/global-posts", async (req, res) => {
  try {
    const posts = await Project.find({ isGlobalPost: true }).populate(
      "user",
      "name avatar"
    );
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by ID (protected route)
router.get('/user/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-hash -salt'); // exclude sensitive info
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


//sob registerd user er details dekhte parbo
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get logged-in user's profile
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id; // comes from JWT payload

    const existuser = await User.findById(userId).select("-password");
    if (!existuser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, existuser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get logged-in user's basic details + all projects
router.get("/user/full", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id; // from JWT

    const userData = await User.findById(userId).select("-password");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const projects = await Project.find({ user: userId });

    res.status(200).json({
      success: true,
      user: userData,
      projects: projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


router.get("/project/:id", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId).populate(
      "user",
      "name avatar"
    );

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Ownership check
    if (project.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this project" });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

//suggestion:- search box er suggestion show korbe
router.get("/suggest", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Query string is required" });
  }

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { skills: { $regex: query, $options: "i" } },
      ],
    })
      .limit(5)
      .select("name avatar _id");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});






//create profile route :- profile create hobe
router.post("/profile",passport.authenticate("jwt", { session: false }),upload.single("avatar"),async (req, res) => {
    try {
      const { name, phone, address, github, bio,twitter, instagram, facebook } = req.body;
      const userId = req.user._id; // from JWT

      // Check if this user already has a profile
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      let avatarUrl = existingUser.avatar || "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

      if (req.file) {
        const result = await uploadcloudinary(req.file.path);
        avatarUrl = result.secure_url;

        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.warn("File not found for deletion:", req.file.path);
        }
      }

      // Update existing user profile
      existingUser.name = name || existingUser.name;
      existingUser.phone = phone || existingUser.phone;
      existingUser.address = address || existingUser.address;
      existingUser.avatar = avatarUrl;
      existingUser.links = { github, twitter, instagram, facebook };
      existingUser.bio=bio || existingUser.bio;

      await existingUser.save();

      res.status(200).json({ success: true, user: existingUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
);

// Create project (JWT protected)
router.post("/project",passport.authenticate("jwt", { session: false }),upload.array("images", 5),async (req, res) => {
    try {
      const { title, description, techStack, projectLink, isGlobalPost } = req.body;

      // Upload images to Cloudinary
      let imageUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadcloudinary(file.path);
          if (result) {
            imageUrls.push(result.secure_url);
          }
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      // Convert techStack from comma-separated string to array (if needed)
      const techArray = techStack
        ? techStack.split(",").map((tech) => tech.trim())
        : [];

      const newProject = new Project({
        isGlobalPost,
        title,
        description,
        techStack: techArray,
        projectLink,
        images: imageUrls,
        user: req.user._id, // ✅ now comes from JWT
      });

      await newProject.save();

      await User.findByIdAndUpdate(req.user._id, {
        $push: { projects: newProject._id },
      });

      console.log("Uploaded Files:", req.files);
      console.log("Image URLs:", imageUrls);

      res.status(201).json({ success: true, project: newProject });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Failed to create project" });
    }
  }
);


//project like korar jonno (project :id)
router.post("/project/:id/like",passport.authenticate("jwt", { session: false }),async (req, res) => {
    const userId = req.user._id; // from JWT
    const projectId = req.params.id;

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const index = project.likes.indexOf(userId);

      if (index === -1) {
        // Not liked yet → Like
        project.likes.push(userId);
      } else {
        // Already liked → Unlike
        project.likes.splice(index, 1);
      }

      await project.save();
      res.status(200).json({ success: true, likesCount: project.likes.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);



/**
 * {
  "name": "arya_deb",
  "phone": "1234",
  "address":"khardah",
  "github":"akkdsa//sada"

}
 */
module.exports = router;
