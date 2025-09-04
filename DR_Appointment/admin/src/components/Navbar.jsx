import React from 'react'
import { useContext } from 'react'
import { assets } from '../assets/assets.js'
import { AdminContext } from '../context/AdminContext.jsx'    
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext.jsx'
const Navbar = () => {

    const {aToken,setAToken} = useContext(AdminContext)
    const {dToken,setDToken} = useContext(DoctorContext)

    const navigate = useNavigate()

    const logout = () => {
      aToken && setAToken('') // Clear the token
      aToken && localStorage.removeItem('aToken') // Remove token from local storage
      dToken && setDToken('') // Clear the token
      dToken && localStorage.removeItem('dToken') // Remove token from local storage
      navigate('/') // Redirect to login page
    }

  return (
    <div className = "flex justify-between items-center p-4 bg-white shadow-md">
        <div className="flex items-center gap-2 text-xs">
            <img className='w-36 sm:w-40 cursor-pointer' src={assets.logo} alt=""/>
            <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
        </div>
        <button onClick={logout} className="bg-primary text-white px-4 py-2 rounded-full">Logout</button>
    </div>
  )
}

export default Navbar