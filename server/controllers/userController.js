import imagekit from "../configs/imageKit.js"
import User from "../models/User.js"
import fs from 'fs'


// Get User Data using userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)
        if(!user){
            return res.json({success: false, message:"User not found"})
        } 
        res.json({success: true, user})
    }
    catch(error){
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// Update User Data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let parsedBody = req.body;
    if (req.body.body) {
    parsedBody = JSON.parse(req.body.body); // 🔥 fix
    }

    let { username, bio, location, full_name } = parsedBody;

    const tempUser = await User.findById(userId);

    // username check
    if (username && tempUser.username !== username) {
      const user = await User.findOne({ username });
      if (user) {
        return res.json({ success: false, message: "Username already taken" });
      }
    } else {
      username = tempUser.username;
    }

    const updatedData = {
      username,
      bio: bio !== undefined ? bio : tempUser.bio,
      location: location !== undefined ? location : tempUser.location,
      full_name: full_name !== undefined ? full_name : tempUser.full_name,
    };

    // profile upload
    const profile = req.files?.profile?.[0];
    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      updatedData.profile_picture = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "512" }],
      });
    }

    // cover upload
    const cover = req.files?.cover?.[0];
    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });
      updatedData.cover_photo = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
      });
    }


    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// Find Users using username, email, location, name

export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { input } = req.body;

        const allUsers = await User.find(
            {
                $or: [
                    {username: new RegExp(input, 'i')},
                    {email: new RegExp(input, 'i')},
                    {full_name: new RegExp(input, 'i')},
                    {location: new RegExp(input, 'i')},
                ]
            }
        )
        const filteredUsers = allUsers.filter(user=> user._id !== userId);

        res.json({success: true, users: filteredUsers})
    }
    catch(error){
        console.log(error);
        res.json({success: false, message: error.message})
    }
}


// Follow User

export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body;

        const user = await User.findById(userId)

        if(user.following.includes(id)){
            return res.json({ success: false, message: 'You are already following this user'})
        }

        user.following.push(id);
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers.push(userId)
        await toUser.save()

        res.json({success: true, message: 'Now you are following this user'})
    }
    catch(error){
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

//Unfollow User
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body;

        const user = await User.findById(userId)
        user.following = user.following.filter(user=> user !== id);
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers = toUser.followers.filter(user=> user !== userId);
        await toUser.save()



        res.json({success: true, message: 'YOu are no longer following this user'})
    }
    catch(error){
        console.log(error);
        res.json({success: false, message: error.message})
    }
}



