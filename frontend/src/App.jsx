import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import AboutUs from './pages/AboutUs'
import DeveloperInfo from './pages/DeveloperInfo'

function App() {


  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/about-us' element={<AboutUs/>} />
      <Route path='/developer-info' element={<DeveloperInfo/>} />
    </Routes>
  )
}
export default App
