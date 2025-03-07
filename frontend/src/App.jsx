import 'prismjs/themes/prism-tomorrow.css'
import prism from 'prismjs'
import { useEffect, useState } from 'react'
import Upload from './components/Upload'
import ResumeReviewPreview from './components/ResumeReviewPreview'

function App() {
  const [formData, setFormData] = useState(null)
  const [responseData, setResponseData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

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
    try {
      setIsLoading(true)
      const response = await fetch(import.meta.env.VITE_BASE_URL, {
        method: 'POST',
        body: formData
      })
      if (response.status === 200) {
      const {data} = await response.json(); 
      setIsLoading(false)
      setResponseData(data)
      }
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
    
  }
  useEffect(()=> {
    if (isLoading) {
      setLoadingMessage('Uploading....')
      setTimeout(()=> {
        setLoadingMessage('Please wait ai is working for you')
      }, 3000)

      setTimeout(()=> {
        setLoadingMessage('Ai doing good for you !!')
      }, 7000)

      setTimeout(()=> {
        setLoadingMessage("Patience bears sweet fruit!!")
      }, 10000)

      setTimeout(()=> {
        setLoadingMessage('Our ai is still working for you. Please wait...')
      }, 13000)
    }
  }, [isLoading])
  return (
    <>
    <main className='w-full h-screen flex text-white max-md:flex-col scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-200'>
      <div className="basis-[50%] bg-black">
        <div className='w-full h-full flex justify-center flex-col items-center'>
        <Upload setShowButton={setShowButton} onChangeHander={onChangeHander}/>
        {
          showButton && (
            <button
            className='px-8 py-2 rounded-md text-2xl font-semibold bg-slate-700'
            onClick={onSubmitHandler}
            >
              Send
              </button>
          )
        }
        </div>
      </div>
      <div className="basis-[50%] bg-gray-950 px-5 py-4 max-md:py-6 min-w-[60%] overflow-x-hidden overflow-y-scroll scroll-smooth">
      <p className='text-center text-2xl font-semibold bg-gray-700 py-2 rounded-sm mb-8'>{
            responseData ? 'Resume summary' : 'No review data yet.'
          }</p>
        {
          isLoading ? (
            <div className='w-full h-full flex justify-center items-center'>
            <p className='font-semibold text-2xl'>
              {loadingMessage}
            </p>
            </div>
          ) : (
            <ResumeReviewPreview PreviewData={responseData}/>
          )
        }
      </div>
    </main>
    </>
  )
}
export default App
