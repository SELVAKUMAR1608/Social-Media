import Notification from "../model/notification.model.js";
import Post from "../model/post.model.js";
import User from "../model/user.model.js";
import cloudinary from "cloudinary"

const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(400).json({ error: "User Not Found" });
        }

        if (!text && !img) {
            return res.status(400).json({ error: "Post Must Have Text Or Image " })
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            img,
            text
        })
        await newPost.save();
        res.status(201).json(newPost)
    } catch (error) {
        console.log(`Error In createPost Controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findOne({ _id: id });

        if (!post) {
            return res.status(404).json({ error: "Post Not Found" })
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ error: "You Are Not Authorised To Delete This Post" });
        }
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete({ _id: id });
        res.status(200).json({ message: "Post Deleted Successfully" })
    } catch (error) {
        console.log(`Error In DeletePost Controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const createComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ error: "Comment Text Is Required" });
        }
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: "Post Not Found" });
        }

        const comment = {
            user: userId,
            text
        }

        post.comment.push(comment);
        await post.save();
        res.status(200).json(post);
        
    } catch (error) {
        console.log(`Error In Create Comment Controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const likeUnLikePosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;

        const post = await Post.findOne({ _id: postId });

        if (!post) {
            return res.status(404).json({ error: "Post Not Found" })
        }

        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            const updatedLikes=post.likes.filter((id)=> id.toString()!==userId.toString())
            res.status(200).json(updatedLikes);
        }
        else {
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } })
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            });
            await notification.save();
            const updatedLikes=post.likes
            res.status(200).json(updatedLikes);
        }


    } catch (error) {
        console.log(`Error In Like UnLike Controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comment.user",
            select: ["-password", "-email", "-following", "-followers", "-bio", "-link"]
        })
        if (posts.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log(`Error In Get All Post Controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById({ _id: userId });
        console.log("Liked Posts:", user.likedPosts);
        if (!user) {
            res.status(404).json({ error: "user Not Found" });
        }
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comment.user",
                select: ["-password", "-email", "-bio", "-link", "-following", "-followers"]
            })
        res.status(200).json(likedPosts);

    } catch (error) {
        console.log(`Error In Get Liked Posts Controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById({ _id: userId });

        if (!user) {
            res.status(404).json({ error: "User Not Found" });
        }

        const following = user.following;

        const feedPost = await Post.find({ user: { $in: following } })
                         .sort({createdAt:-1})
                         .populate({
                            path:"user",
                            select:"-password",
                         })
                         .populate({
                            path:"comment.user",
                            select:["-password","-email","-bio","-link",]
                         })
                         res.status(200).json(feedPost);

    } catch (error) {
        console.log(`Error In Get Following Posts Controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getUserPosts=async (req,res) => {
    try {
        const {username}=req.params;
        const user=await User.findOne({username});

        if(!user){
            return res.status(404).json({error:"User Not Found"});
        }

        const posts=await Post.findOne({user:user._id})
                   .sort({createdAt:-1})
                   .populate({
                        path:"user",
                        select:"-password",
                   })
                   .populate({
                        path:"comment.user",
                        select:"-password",
                   })
         res.status(200).json(posts);
    } catch (error) {
        console.log(`Error In Get User Posts Controller:${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
export { createPost, deletePost, createComment, likeUnLikePosts, getAllPosts, getLikedPosts, getFollowingPosts,getUserPosts };