import express from 'express';
import { registerUser,loginUser, getProfile,updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentBkash, handleSuccess, handleFail } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';
//import { use } from 'react';



const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile', authUser, getProfile);
// ...existing code...
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile);
// ...existing code...
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointment);

//
userRouter.post('/payment-bkash', authUser, paymentBkash);
userRouter.post('/payment/success/:tran_id', handleSuccess);
userRouter.post('/payment/failed', handleFail);



export default userRouter;
