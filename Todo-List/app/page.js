import Addtask from '@/public/Addtask'
import React from 'react'

const page = () => {
  return (
    <>
    <div className='bg-white text-black py-15 flex align-middle justify-center text-4xl'>MY TODO LIST</div>
    <Addtask/>
    </>
  )
}

export default page