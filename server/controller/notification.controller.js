import Notification from "../model/notification.model.js";


const getNotification=async (req,res) => {
    try {
        const userId=req.user._id;
        const notification=await Notification.find({to:userId})
                           .populate({
                            path:"from",
                            select:"username profileImg"
                           })
        await Notification.updateMany({to:userId},{read:true});
        res.status(200).json(notification);
    } catch (error) {
        console.log(`Error In Get Notification Controller: ${error}`);
        return res.status(500).json({error:"Internal server error"})
    }
}

const deleteNotification=async (req,res) => {
    try {
        const userId=req.user._id;
        await Notification.deleteMany({to:userId});
        res.status(200).json({message:"Notification Deleted successfully"})
    } catch (error) {
        console.log(`Error In Delete Notification Controller: ${error}`);
        return res.status(500).json({error:"Internal server error"})
    }
}

export {getNotification,deleteNotification}