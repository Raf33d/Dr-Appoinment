import jwt from 'jsonwebtoken'

//doctor authentication middleware

const authDoctor = (req, res, next) => {
    try {
        const  dtoken  = req.headers.dtoken
        if (!dtoken) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)

        req.docId = token_decode.id // <-- FIXED

        next();

    } catch (error) {
        console.error("Error during user authentication:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default authDoctor;