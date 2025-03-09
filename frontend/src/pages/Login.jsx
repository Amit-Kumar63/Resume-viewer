import React from 'react'
import { provider, signInWithPopup, auth } from '../../firebase.config'
import { Link } from 'react-router-dom'

const Login = () => {

    const login = async (token)=> {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/login`, {
            method: 'GET',
            headers : {
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await response.json()
        console.log(data)
    }


    const loginHandler = async ()=> {
        try {
          const result = await signInWithPopup(auth, provider)
          const token = await result.user.getIdToken(true)
          login(token)
        } catch (error) {
          console.error(error.message || 'Something went wrong while signup')
        }
      }
  return (
    <div className='bg-black w-full h-screen text-white'>
      
    <div className='bg-gray-900 w-[300px] py-5 mx-auto translate-y-1/2 rounded-md flex flex-col gap-3.5 justify-center items-center'>
    <h1 className='text-3xl mb-5 font-semibold'>Login</h1>
    <h4 className='font-semibold text-base'>Login with google account</h4>
    <button 
    onClick={loginHandler}
    className='px-10 bg-gray-600 font-semibold rounded-md hover:rounded-full cursor-pointer'>
      <img src="google.png" alt="google-icon" 
      className='w-30 h-14 object-cover'
      />
    </button>
    <p className='text-sm'>Don't have any account? <Link to='/signup' className='text-blue-700'>signup</Link></p>
    </div>
  </div>
  )
}

export default Login