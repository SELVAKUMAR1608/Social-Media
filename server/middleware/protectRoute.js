import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
    try {
        const token= await req.cookies.jwt;
        if(!token){
            return res.status(400).json({error:"unauthorized: No Token Provided"});
        }

        const decoded= await jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(400).json({error:"unauthorized: Invalid Token"});
        }

        const user=await User.findOne({_id:decoded.userId}).select("-password");
        if(!user){
            return res.status(400).json({error:"User Not Found"});
        }
        req.user=user;
        next();
    } catch (error) {
        console.log(`Error In ProtectRoute Middleware : ${error} `);
        res.status(500).json({ error: "Internal Server Error" })
    }

}
export default protectRoute;