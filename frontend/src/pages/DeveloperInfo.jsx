import React from 'react'
import { Link } from 'react-router-dom'

const DeveloperInfo = () => {
  return (
    <main className='w-full h-screen flex text-white max-md:flex-col scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-200'>
    <div className="basis-[50%] bg-black min-md:border-r border-solid border-gray-500 max-md:border-b p-6 flex flex-col justify-center items-center text-center">
      <h1 className='text-3xl font-bold mb-4'>Meet the Developer</h1>
      <div className='text-lg max-lg:text-base text-gray-300 flex flex-col gap-3'>
        <h4>Amit Kumar</h4>
        <Link className='border border-solid border-gray-600 px-2 py-1' to='https://github.com/Amit-Kumar63'>Github</Link>
        <Link className='border border-solid border-gray-600 px-2 py-1' to='www.linkedin.com/in/amit-kumar-3688b4286'>Linkdin</Link>
        <Link className='border border-solid border-gray-600 px-2 py-1' to="https://wa.me/7651871602">WhatsApp</Link>
      </div>
    </div>
    <div className="basis-[50%] bg-gray-950 px-5 py-4 max-md:py-6 min-w-[60%] overflow-x-hidden overflow-y-scroll scroll-smooth">
      <h2 className='text-center text-2xl font-semibold bg-gray-700 py-2 rounded-sm mb-4'>Developer Skills & Technologies</h2>
      <ul className='list-disc list-inside text-gray-300 text-lg max-lg:text-base space-y-3'>
        <li>Expertise in JavaScript, React, and Next.js</li>
        <li>Backend development with Node.js and Express</li>
        <li>AI and machine learning integration</li>
        <li>Database management with MongoDB & Firebase</li>
        <li>Passionate about building AI-driven applications</li>
      </ul>
    </div>
  </main>
  )
}

export default DeveloperInfo