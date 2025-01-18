import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import {getProfile,followUnFollowUser,getSuggestedUser,updateUser} from '../controller/user.controller.js';
const router=express.Router();

router.get("/profile/:username",protectRoute,getProfile);
router.post("/follow/:id",protectRoute,followUnFollowUser);
router.get("/suggested",protectRoute,getSuggestedUser);
router.post("/updateUser",protectRoute,updateUser);

export default router;