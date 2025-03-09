import React from 'react'
import { useNavigate } from 'react-router-dom'

const AboutUs = () => {
    const navigate = useNavigate()
  return (
    <main className='w-full h-screen flex text-white max-md:flex-col scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-200'>
      <div className="basis-[50%] bg-black min-md:border-r border-solid border-gray-500 max-md:border-b p-6 flex flex-col justify-center items-center text-center">
        <h1 className='text-3xl font-bold mb-4'>About Our AI Resume Reviewer</h1>
        <p className='text-lg max-lg:text-base text-gray-300'>
          Our AI-powered resume analyzer takes your uploaded resume and provides
          insights into your strengths, weaknesses, and areas for improvement. 
          It helps you craft the best version of your resume for potential employers.
        </p>
        <button
          className='mt-6 px-4 py-2 bg-slate-700 text-xl font-semibold rounded-md hover:bg-gray-800 transition-all'
          onClick={() => navigate('/')}
        >
          Get Started
        </button>
      </div>
      <div className="basis-[50%] bg-gray-950 px-5 py-4 max-md:py-6 min-w-[60%] overflow-x-hidden overflow-y-scroll scroll-smooth">
        <h2 className='text-center text-2xl font-semibold bg-gray-700 py-2 rounded-sm mb-4'>How It Works</h2>
        <ul className='list-disc list-inside text-gray-300 text-lg max-lg:text-base space-y-3'>
          <li>Upload your resume in PDF, JPG format.</li>
          <li>Our AI scans and analyzes key resume aspects.</li>
          <li>Get a detailed report on strengths, weaknesses, and improvements.</li>
          <li>Optimize your resume for better job opportunities.</li>
        </ul>
      </div>
    </main>
  )
}

export default AboutUs