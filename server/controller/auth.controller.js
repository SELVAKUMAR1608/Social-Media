import User from '../model/user.model.js'
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

const signup = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;
        console.log("reqbody:", req.body);


        if (!username || !fullName || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email Format" })
        }

        const existingEmail = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });
        const existingFullName = await User.findOne({ fullName });
        if (existingEmail || existingUsername) {
            return res.status(400).json({ error: "Username or Email  Exist" });
        }

        if(existingFullName){
            return res.status(400).json({error:"Fullname Already Exist"})
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must have atleast 6 character" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
        })

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(200).json({
                _id: newUser._id,
                username: newUser.username,
                fullname: newUser.fullname,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link,

            })
        }
        else {
            res.status(404).json({ error: "Invalid User Data" });
        }


    } catch (error) {
        console.log(`Error in signup controller: ${error}`);
        res.status(500).json({ error: "Internal Server Error" })

    }
}
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("reqbody:", req.body);

        if(!username){
            return res.status(400).json({error:"Enter Username"})
        }

        if(!password){
            return res.status(400).json({error:"Enter Password"})
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Invalid Username or Password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password );
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid Username or Password" });
        }
        // if (!user || !isPasswordCorrect) {
        //     return res.status(400).json({ error: "Invalid Username Or Password" });
        // }

        generateToken(user._id, res)
        res.status(200).json(
            {
                _id: user._id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
                bio: user.bio,
                link: user.link,
            }
        )
    } catch (error) {
        console.log(`Error In Login Controller : ${error} `);
        res.status(500).json({ error: "Internal Server Error" })

    }
}
const logout = async (req, res) => {
    try {
        res.cookie("jwt", " ", { maxAge: 0 });
        res.status(200).json({ message: "Logout successfull" });
    } catch (error) {
        console.log(`Error In Logout Controller : ${error} `);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getme = async (req,res) => {
  try {
    const user=await User.findOne({_id:req.user._id}).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log(`Error In getme Controller : ${error} `);
    res.status(500).json({ error: "Internal Server Error" })
  }
}


export { signup, login, logout, getme };