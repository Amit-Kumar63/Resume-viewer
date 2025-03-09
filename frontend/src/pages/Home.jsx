import 'prismjs/themes/prism-tomorrow.css'
import prism from 'prismjs'
import { useEffect, useRef, useState } from 'react'
import Upload from '../components/Upload'
import ResumeReviewPreview from '../components/ResumeReviewPreview'
import getFingerprint from '../utils/getFingerprint'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase.config'
import { toast } from 'react-toastify'

const Home = () => {
    const [formData, setFormData] = useState(null)
    const [responseData, setResponseData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [isRedirect, setIsRedirect] = useState(false)

    const navigate = useNavigate()

    useEffect(()=> {
      prism.highlightAll()
    })
  
    const [showButton, setShowButton] = useState(false)
  
    const onChangeHander = (e)=> {
      if (e.target.files && e.target.files.length > 0) {
        const fileData = new FormData();
        fileData.append('file', e.target.files[0]);
        setFormData(fileData);
        setShowButton(true);
      }
  }
  
    const onSubmitHandler = async ()=> {
      if (!formData) return;
      const fp = await getFingerprint()
      const currentUser = auth.currentUser;
      const token = currentUser ? await currentUser.getIdToken(true) : null;
        setIsLoading(true)
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/get-response`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fp}`,
            'token': token || null
          },
          body: formData,
        })
        const {data, message} = await response.json();

        if (response.status === 403) {
          toast.error(message || 'Limite exceed')
          setIsLoading(false)
          setIsRedirect(true)
        }

        if (response.status === 200) {
          toast.success(message || 'Resume analyzed successfully')
        setIsLoading(false)
        setResponseData(data)
        } else {
          toast.error(message || 'Something went wrong')
          setIsLoading(false)
        setResponseData(message)
        console.error(message)
        }
    }
    const timeouts = useRef([]);
    useEffect(() => {
      if (isLoading) {
          setLoadingMessage('Uploading....');
          
          timeouts.current = [
              setTimeout(() => setLoadingMessage('Please wait, AI is working for you'), 3000),
              setTimeout(() => setLoadingMessage('AI is doing good for you !!'), 9000),
              setTimeout(() => setLoadingMessage('Patience bears sweet fruit!!'), 14000),
              setTimeout(() => setLoadingMessage('Our AI is still working for you. Please wait...'), 20000),
          ];
      } else {
          timeouts.current.forEach(clearTimeout);
          timeouts.current = [];
      }

      return () => {
          timeouts.current.forEach(clearTimeout);
          timeouts.current = [];
      };
  }, [isLoading]);

    useEffect(() => {
      if (isRedirect) {
        setTimeout(()=> {
          navigate('/login')
        }, 2000)
      }
    }, [isRedirect]);
  return (
    <main className='w-full h-screen flex text-white max-md:flex-col scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-200'>
    <div className="basis-[50%] bg-black min-md:border-r border-solid border-gray-500 max-md:border-b">
      <div className='w-full h-full flex justify-center flex-col items-center'>
      <Upload setShowButton={setShowButton} onChangeHander={onChangeHander}/>
      {
        showButton && (
          <button
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-xl max-lg:text-base max-lg:px-3 font-semibold ${isLoading ? 'bg-gray-900' : 'bg-slate-700'} ${isLoading ? 'cursor-none' : 'cursor-pointer'}`}
          onClick={onSubmitHandler}
          >
            {
              isLoading ? 'Uploading...' : 'Check your resume'
            }
            </button>
        )
      }
      </div>
    </div>
    <div className="basis-[50%] bg-gray-950 px-5 py-4 max-md:py-6 min-w-[60%] overflow-x-hidden overflow-y-scroll scroll-smooth">
    <p className='text-center text-xl max-lg:text-lg  font-semibold bg-gray-700 py-2 rounded-sm mb-8'>{
          responseData ? 'Resume summary' : 'No review data yet.'
        }</p>
      {
        isLoading ? (
          <div className='w-full h-full flex justify-center items-center'>
          <p className='font-semibold text-2xl max-lg:text-xl max-md:text-base'>
            {loadingMessage}
          </p>
          </div>
        ) : (
          <ResumeReviewPreview PreviewData={responseData}/>
        )
      }
    </div>
  </main>
  )
}

export default Home