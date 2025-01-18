import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';

const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User Not Found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(`Error In Get User Profile controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });

    }
}

const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById({ _id: id });
        const currentUser = await User.findById({ _id: req.user._id });

        if (id === req.user._id) {
            return res.status(400).json({ error: "You Can`t Follow Or Un Follow Yourself " })
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not Found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            await User.findByIdAndUpdate({ _id: id }, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { following: id } });
            res.status(200).json({ message: "Unfollow Successfull" });
        } else {
            await User.findByIdAndUpdate({ _id: id }, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate({ _id: req.user._id }, { $push: { following: id } });
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            })
            newNotification.save();
            res.status(200).json({ message: "Follow successfull" })
        }
    } catch (error) {
        console.log(`Error In Follow Un Follow controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({ _id: userId }).select("-password");
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            }, {
                $sample: {
                    size: 10
                }
            }
        ])

        const filteredUsers = await users.filter((user) => !userFollowedByMe.following.includes(user._id));
        const suggestedUser = filteredUsers.splice(0, 6);
        suggestedUser.forEach((user) => user.password = null);
        res.status(200).json(suggestedUser);

    } catch (error) {
        console.log(`Error In Suggestion controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        let { username, fullName, email, currentPassword, newPassword, bio, link } = req.body;
        let { profileImg, coverImg } = req.body;

        let user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not Found" })
        }

        if (fullName) {
            const duplicateFullName = await User.findOne({ fullName, _id: { $ne: userId } });
            if (duplicateFullName) {
                return res.status(400).json({ error: "Full Name already exists" });
            }
        }

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please Provide Both Current And New Password" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current Password is Incorrect" })
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password Must Have Atleast 6 Character" })
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if (profileImg) {
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg

        user =await user.save();
        user.password = null;
        return res.status(200).json(user);

    } catch (error) {
        console.log(`Error In updateUser controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export { getProfile, followUnFollowUser, getSuggestedUser, updateUser };