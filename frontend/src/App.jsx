import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import AboutUs from './pages/AboutUs'
import DeveloperInfo from './pages/DeveloperInfo'
import { ToastContainer } from 'react-toastify'
import Navigation from './components/Navigation'
import Background from './components/Background'

function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className='relative min-h-screen overflow-x-hidden'>
      <Background />
      <Navigation />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about-us' element={<AboutUs />} />
        <Route path='/developer-info' element={<DeveloperInfo />} />
      </Routes>
      <ToastContainer limit={2} position='bottom-center' theme='dark' autoClose={3500} hideProgressBar={false} />
    </div>
  )
}
export default App
