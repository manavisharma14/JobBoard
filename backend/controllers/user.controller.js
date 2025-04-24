// controller is business logic
import bcrypt from 'bcrypt';

export const register = async(req, res) => {
    try{
        const {fullname, email, password, role} = req.body;
        if(!fullname || !email || !password || !role){
            return res.status(400).json({
                message:"Please fill all fields",
                success:false
            });
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                "message":"User already exists",
                success:false
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullname,
            email,
            password:hashedPassword,
            role
        })


    }
    catch(error){
        return res.status(500).json({message:error.message});
    }
}