import 'prismjs/themes/prism-tomorrow.css'
import prism from 'prismjs'
import { useEffect, useState } from 'react'
import Upload from './components/Upload'
import ResumeReviewPreview from './components/ResumeReviewPreview'

function App() {
  const [formData, setFormData] = useState(null)
  const [responseData, setResponseData] = useState(null)

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
    const response = await fetch(import.meta.env.VITE_BASE_URL, {
      method: 'POST',
      body: formData
    })
    const {data} = await response.json(); 
    setResponseData(data)
  }

  return (
    <>
    <main className='w-full h-screen bg-red-700 flex text-white max-md:flex-col'>
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
      <div className="basis-[50%] bg-gray-950 px-3 py-4 min-w-[50%]">
        {
          responseData ? (
            <ResumeReviewPreview PreviewData={responseData}/>
          ): 
          (
          <p className='text-center text-2xl font-semibold bg-gray-700 py-2 rounded-sm'>No review data yet.</p>
        )
        }
      </div>
    </main>
    </>
  )
}
export default App
