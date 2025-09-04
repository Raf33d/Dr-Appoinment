import jwt from 'jsonwebtoken'

//use authentication middleware
const authUser = (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        req.userId = token_decode.id // <-- FIXED

        next();

    } catch (error) {
        console.error("Error during user authentication:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default authUser;