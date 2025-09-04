import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>All Doctors</h1>

      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          doctors.map((item, index) =>
            <div
              className='border border-indigo-200 rounded-xl overflow-hidden cursor-pointer group flex flex-col items-center justify-between'
              key={index}
              style={{ width: '260px', height: '320px' }} // Fixed size for each card
            >
              <img
                src={item.image}
                alt={item.name}
                className='object-cover w-full'
                style={{ height: '180px' }} // Fixed image height
              />
              <div className='px-3 py-2 w-full flex-1 flex flex-col justify-between'>
                <p className='font-semibold'>{item.name}</p>
                <p className='text-sm text-gray-600'>{item.speciality}</p>
                <div className='flex items-center gap-2 mt-2'>
                  <input onChange={() => changeAvailability(item._id)}
                    type="checkbox"
                    checked={item.available}
                    className="accent-green-600"
                  />
                  <p className='text-xs'>Available</p>
                </div>
              </div>
            </div>
          )
        }
      </div>

    </div>
  )
}

export default DoctorsList