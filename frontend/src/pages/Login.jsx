import { provider, signInWithPopup, GoogleAuthProvider, auth } from '../../firebase.config'

const Login = () => {

  const signup = async (token)=> {
    console.log(token)
    const res = fetch('http://localhost:8100/ai/v2/user/signup', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    })
    const respone = await res.json()
    console.log(respone)
  }

  const loginHandler = async ()=> {
    try {
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken(true)
      signup(token)
    } catch (error) {
      console.error(error.message || 'Something went wrong while signup')
    }
  }
  return (
    <div className='bg-black w-full h-screen'>
      <div className='bg-gray-900 w-[500px] h-[500px] mx-auto translate-y-1/2 rounded-md flex justify-center items-center'>
      <button 
      onClick={loginHandler}
      className='px-10 bg-gray-600 font-semibold rounded-md hover:rounded-full cursor-pointer'>
        <img src="google.png" alt="google-icon" 
        className='w-30 h-16 object-cover'
        />
      </button>
      </div>
    </div>
  )
}

export default Login