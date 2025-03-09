import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { auth, signOut } from '../../firebase.config'

const Navigation = () => {
    const [openMenu, setOpenMenu] = useState(false)
    const [token, setToken] = useState(null)

    const navigate = useNavigate()

    const login = ()=> {
        setOpenMenu(false)
        navigate('/login')
    }
    const signup = ()=> {
        setOpenMenu(false)
        navigate('/signup')
    }

    useEffect(()=> {
        setToken(localStorage.getItem('ai.hr'))
    }, [])

    const logoutHandler = async ()=> {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/logout`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const { data, message } = await res.json()
        if (res.status === 200) {
            toast.success(message || 'User logged out')
            localStorage.removeItem('ai.hr')
            await signOut(auth)
            setTimeout(()=> {
                navigate('/login')
            }, 2000)
        }
    }
  return (
    <header className='w-full py-4 px-5 bg-gray-900 text-white flex justify-between items-center'>
        <Link to='/'>
        <img src="logo.png" alt="logo" className='w-12 h-w-12 object-cover'/>
        </Link>
        <nav className='flex items-center gap-5 text-lg font-semibold max-md:hidden'>
            <Link to='/'>Home</Link>        
            <Link to='/about-us'>About Us</Link>
            <Link to='/developer-info'>Developer Info</Link>
        </nav>
        <div className='flex gap-5 max-md:hidden'>
            {
                token ? (
                    <button
                    onClick={logoutHandler}
                    className='py-2 px-4 font-semibold border border-solid border-gray-600 rounded-md hover:rounded-full cursor-pointer'
                    >Logout</button>
                ) : (
                    <>
                <button
            onClick={login}
            className='py-2 px-4 font-semibold border border-solid border-gray-600 rounded-md hover:rounded-full cursor-pointer'
            >
                Login
            </button>
            <button
            onClick={signup}
            className='py-2 px-4 font-semibold border border-solid border-gray-600 rounded-md hover:rounded-full cursor-pointer'
            >
                Signup
            </button>
                </>
                )
            }
        </div>
        <div className='hidden max-md:flex relative'>
        {
            openMenu ? <i className="ri-menu-3-line text-3xl" 
            onClick={()=> setOpenMenu(!openMenu)}
            /> : 
            <i className="ri-menu-line text-3xl" 
            onClick={()=> setOpenMenu(!openMenu)}
            />
        }
        {
            openMenu && (
                <div className='select-none absolute z-10 px-5 py-4 gap-5 flex flex-col w-40 rounded-sm bg-gray-500 right-2 top-8'>
                <button
                onClick={login}
                    className='py-2 px-4 font-semibold border border-solid border-gray-600 rounded-md hover:rounded-full cursor-pointer'
                    >
                        Login
                    </button>
                    <button
                    onClick={signup}
                    className='py-2 px-4 font-semibold border border-solid border-gray-600 rounded-md hover:rounded-full cursor-pointer'
                    >
                        Signup
                    </button>
                    <nav className='flex flex-col text-center items-center gap-5 text-base font-semibold'>
            <Link 
            onClick={()=> setOpenMenu(false)}
            to='/' className='border-b border-solid border-gray-600 w-full pb-3'>Home</Link>        
            <Link 
            onClick={()=> setOpenMenu(false)}
            to='/about-us' className='border-b border-solid border-gray-600 w-full pb-3'>About Us</Link>
            <Link 
            onClick={()=> setOpenMenu(false)}
            to='/developer-info' className='w-full'>Developer Info</Link>
        </nav>
                </div>
            )
        }
        </div>
    </header>
  )
}

export default Navigation