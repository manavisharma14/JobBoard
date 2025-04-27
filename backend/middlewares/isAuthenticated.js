import jwt from 'jsonwebtoken';

const isAuthenticated = async (req, res, next) => {
    try {
        let token;

        // First try to get token from cookies
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Else try to get token from Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]; // Get token after 'Bearer'
        }

        if (!token) {
            return res.status(401).json({
                message: "You are not authenticated",
                success: false
            });
        }

        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        if(!decode){
            return res.status(401).json({
                message: "Invalid token",
                success: false
            })
        }

        req.id = decode.id;
        next();

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export default isAuthenticated;