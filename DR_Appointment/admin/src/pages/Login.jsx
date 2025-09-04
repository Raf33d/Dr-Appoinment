import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets.js'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext.jsx'

const Login = () => {
  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const { setAToken, backendUrl } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)

  const onSubmitHandler = async (event) => {

    event.preventDefault()

    try {

      if (state === 'Admin') {

        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        console.log(data) // <--- Add this line
        if (data.success) {

          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
          console.log(data.token)
        } else {
          toast.error(data.message || 'Login failed')

        }


      } else {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {

          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
          console.log(data.token)
        } else {
          toast.error(data.message || 'Login failed')

        }
      }
    } catch (error) {

    }

  }






  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state}</span> Login</p>
        <div className="w-full">
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="border border-[#DADADA] p-2 rounded w-full mt-1" />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className="border border-[#DADADA] p-2 rounded-md w-full mt-1" />
        </div>
        <button className="bg-primary text-white p-2 rounded-md text-base w-full">Login</button>
        {
          state === 'Admin' ? (
            <p className='text-xs text-[#5E5E5E]'>Doctor Login? <span className='text-primary cursor-pointer underline' onClick={() => setState('Doctor')}>Click here</span></p>
          ) : (
            <p className='text-xs text-[#5E5E5E]'>Admin Login? <span className='text-primary cursor-pointer underline' onClick={() => setState('Admin')}>Click here</span></p>
          )
        }

      </div>
    </form>
  )
}

export default Login