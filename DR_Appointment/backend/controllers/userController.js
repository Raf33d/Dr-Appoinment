import validator from 'validator';
import bycrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
//import appointmentData from '../models/appointmentModel.js';
import SSLCommerzPayment from 'sslcommerz-lts';


//API to register user
const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Please fill all fields' });
        }

        //validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Invalid email format' });
        }


        //validate password strength
        if (password.length < 8) {
            return res.json({ success: false, message: 'Weak password. Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.' });
        }

        //hashing user password
        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(201).json({ success: true, message: 'User registered successfully', token });

    } catch (error) {

        res.status(500).json({ success: false, message: error.message });

    }
};

//API for user login

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const isMatch = await bycrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, message: 'User logged in successfully', token });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }



}


//API to get user profile data

const getProfile = async (req, res) => {
    try {

        const userId = req.userId
        const userData = await userModel.findById(userId).select('-password');
        res.json({ success: true, userData });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.json({ success: false, message: "Internal server error" });
    }
}

//API to update user profile

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        // Validate input
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Please fill all fields" });
        }

        // Update user data
        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });


        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageUrl = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, { image: imageUrl });
        }
        res.json({ success: true, message: "Profile updated successfully" });

    } catch (error) {
        console.error("Error updating user profile:", error);
        res.json({ success: false, message: "Internal server error" });
    }
}

//API to book appointment
const bookAppointment = async (req, res) => {
    try {

        const userId = req.userId;
        const { docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select('-password');

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor is not available' });
        }

        let slots_booked = docData.slots_booked
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot already booked' });
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password');

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            amount: docData.fees,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        res.json({ success: true, message: 'Appointment booked successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}

const listAppointment = async (req, res) => {
    try {
        const userId = req.userId; // Use userId from auth middleware
        const appointments = await appointmentModel.find({ userId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const cancelAppointment = async (req, res) => {
    try {
        const userId = req.userId; // Get from auth middleware, not req.body
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointmentData.userId.toString() !== userId.toString()) {
            return res.json({ success: false, message: "You are not authorized to cancel this appointment" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;

        const doctorData = await doctorModel.findById(docId);

        if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
            doctorData.slots_booked[slotDate] = doctorData.slots_booked[slotDate].filter(e => e !== slotTime);
            await doctorModel.findByIdAndUpdate(docId, { slots_booked: doctorData.slots_booked });
        }

        res.json({ success: true, message: "Appointment cancelled successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const store_id = process.env.STORE_ID 
const store_passwd = process.env.STORE_PASS 
const is_live = false //true for live, false for sandbox

const paymentBkash = async (req, res) => {
    const { appointmentId } = req.body;
    console.log(appointmentId);
    try {
        const appointmentData = await appointmentModel.findById(appointmentId);
        console.log(appointmentData);
        const tran_id = appointmentId
        const data = {
        total_amount: appointmentData.amount,
        currency: 'BDT',
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: `http://localhost:4000/api/user/payment/success/${tran_id}`,
        fail_url: 'http://localhost:4000/api/user/payment/failed',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        res.json({success: true, url:GatewayPageURL})
        console.log('Redirecting to: ', GatewayPageURL)
    });
        
    } catch (error) {
        
    }
}

const handleSuccess = async (req, res) => {
    const { tran_id } = req.params;
    try {
        await appointmentModel.findByIdAndUpdate(tran_id, {payment: true})
        res.redirect('http://localhost:5173/my-appointments')
    } catch (error) {
        
    }
}

const handleFail = async (req, res) => {
    res.redirect('http://localhost:5173/failed')
}

   



export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentBkash, handleSuccess, handleFail }; 