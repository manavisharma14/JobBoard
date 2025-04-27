// controller is business logic
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {User} from '../models/user.model.js'

export const register = async (req, res) => {
    try {
        const { fullname, email, password, phoneNumber, role } = req.body;
        if (!fullname || !email || !password || !role) {
            return res.status(400).json({
                message: "Please fill all fields",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                "message": "User already exists",
                success: false
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role
        })

        res.status(201).json({
            message: "User created successfully",
            success: true,
            user: newUser
        })
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const login = async (req, res) => {
    try {
        const { email, password , role} = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please fill all fields",
                success: false
            })
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            })
        }
        // check role is correct or not

        if (role != user.role) {
            return res.status(400).json({
                message: "Account does not exist with this role ",
                success: false
            })
        };

        const tokenData = {
            id: user._id,
        }

        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "1d" });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,


        }
        res.status(200).cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production"
        }).json({
            message: `welcome back ${user.fullname}`,
            user,
            success: true,
        })



    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const logout = async(req, res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge: 0}).json({
            message: "Logout success",
            success: true,
        })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const updateProfile = async(req, res) => {
    try{
        const {fullname, email, phoneNumber, bio, skills} = req.body;
        const file = req.file;
        

        // cloudinary will come here later

        let skillsArray;
        if(skills){
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        };

        if(fullname) user.fullname = fullname;
        if(email) user.email = email;
        if(phoneNumber) user.phoneNumber = phoneNumber;
        if(bio) user.bio = bio;
        if(skills) user.profile.skills = skillsArray;



        // resume comes here later
        await user.save();
        

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true,
        })
    } catch(error){
        return res.status(500).json({message: error.message});
    }
}