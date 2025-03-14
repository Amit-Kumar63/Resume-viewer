import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import AboutUs from './pages/AboutUs'
import DeveloperInfo from './pages/DeveloperInfo'
import { ToastContainer } from 'react-toastify'
import Navigation from './components/Navigation'

function App() {
  return (
    <section className='w-full h-screen overflow-hidden'>
    <Navigation/>
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/about-us' element={<AboutUs/>} />
      <Route path='/developer-info' element={<DeveloperInfo/>} />
    </Routes>
    <ToastContainer limit={1} toastStyle={{width: 'fit-content', marginBottom: '100px', borderRadius: '4px'}} position='bottom-center'/>
    </section>
  )
}
export default App
