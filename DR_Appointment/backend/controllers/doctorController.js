import doctorModel from '../models/doctorModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js';

const changeAvailability = async (req, res) => {


  try {

    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
    res.json({ success: true, message: "Doctor availability updated" });

  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.json({ message: 'Internal server error' });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(['-password', '-email']);
    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Error fetching doctor list:', error);
    res.json({ success: false, message: 'Internal server error' });
  }
};

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: 'Invalid Credentials' });
    }

  } catch (error) {
    console.error('Error fetching doctor list:', error);
    res.json({ success: false, message: 'Internal server error' });
  }
}

//api to get doctor info for doctor panel

const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.doctorId; // Set by your authDoctor middleware
    //const appointments = await appointmentModel.find({ docId })
    const appointments = await appointmentModel.find({ docId: req.docId }).populate('userId');

    res.json({ success: true, appointments })
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}

//api to mark appointment completed for doctor panel
/*const appointmentComplete = async (req, res) => {
  try {

    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
      return res.json({ success: true, message: 'Appointment marked as completed' });
    }

    else {
      return res.json({ success: false, message: 'Mark Failed' });
    }

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}*/

const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
    res.json({ success: true, message: "Marked as completed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//api to cancel appointment for doctor panel
/*const appointmentCancel = async (req, res) => {
  try {

    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
      return res.json({ success: true, message: 'Appointment Cancelled' });
    }

    else {
      return res.json({ success: false, message: 'Cancellation Failed' });
    }

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}*/

const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId; // from auth middleware

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId.toString() === docId.toString()) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
      return res.json({ success: true, message: 'Appointment Cancelled' });
    } else {
      return res.json({ success: false, message: 'Cancellation Failed' });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get dashboard data for doctor panel
/*const doctorDashboard = async (req, res) => {
  try {
    const docId = req.body; // Set by your authDoctor middleware
    const appointments = await appointmentModel.find({ docId })

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {

        earnings += item.amount

      }
    })

    let patients = []

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId)
      }
    })

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5)
    }

    res.json({ success: true, dashData })

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}*/

const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId; // from auth middleware
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount || 0;
      }
    });

    let patients = [];
    appointments.forEach((item) => {
      if (!patients.includes(item.userId.toString())) {
        patients.push(item.userId.toString());
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5)
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//api to doctor profile for doctor panel
const doctorProfile = async (req, res) => {
  try {
    const  docId  = req.docId; // Set by your authDoctor middleware
    const profileData = await doctorModel.findById(docId).select('-password')

    res.json({ success: true, profileData })

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}

//api update doctor profile for doctor panel
/*const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body; // Set by your authDoctor middleware
    await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

    res.json({ success: true, message: 'Profile Updated' })

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}*/

const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.docId; // or req.doctorId, depending on your auth middleware
    const { address, fees, available } = req.body;

    await doctorModel.findByIdAndUpdate(
      docId,
      {
        'address.line1': address.line1,
        'address.line2': address.line2,
        fees,
        available
      },
      { new: true }
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile
};
