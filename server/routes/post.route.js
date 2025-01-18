import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import {createComment, createPost,deletePost,likeUnLikePosts,getAllPosts,getLikedPosts, getFollowingPosts,getUserPosts} from '../controller/post.controller.js';

const router=express.Router();

router.get("/likedpost/:id",protectRoute,getLikedPosts);
router.get("/allpost",protectRoute,getAllPosts);
router.get("/following",protectRoute,getFollowingPosts);
router.get("/user/:username",protectRoute,getUserPosts);
router.post("/create",protectRoute,createPost);
router.post("/like/:id",protectRoute,likeUnLikePosts);
router.post("/comment/:id",protectRoute,createComment);
router.delete("/:id",protectRoute,deletePost);

export default router;