import 'prismjs/themes/prism-tomorrow.css';
import prism from 'prismjs';
import { useEffect, useRef, useState } from 'react';
import Upload from '../components/Upload';
import ResumeReviewPreview from '../components/ResumeReviewPreview';
import getFingerprint from '../utils/getFingerprint';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase.config';
import { toast } from 'react-toastify';

const Home = () => {
  const [formData, setFormData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isRedirect, setIsRedirect] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();
  const timeouts = useRef([]);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  const onChangeHandler = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileData = new FormData();
      fileData.append('file', e.target.files[0]);
      setFormData(fileData);
      setShowButton(true);
    }
  };

  const onSubmitHandler = async () => {
    if (!formData) return;
    const fp = await getFingerprint();
    const currentUser = auth.currentUser;
    const token = currentUser ? await currentUser.getIdToken(true) : null;
    setIsLoading(true);
    
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/get-response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fp}`,
        'token': token || null
      },
      body: formData,
    });

    const { data, message } = await response.json();
    if (response.status === 403) {
      toast.error(message || 'Limit exceeded');
      setIsLoading(false);
      setIsRedirect(true);
    } else if (response.status === 200) {
      toast.success(message || 'Resume analyzed successfully');
      setResponseData(data);
    } else {
      toast.error(message || 'Something went wrong');
      setResponseData(message);
    }
    if (!data) {
    setIsLoading(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      setLoadingMessage('Uploading...');
      timeouts.current = [
        setTimeout(() => setLoadingMessage('Please wait, AI is analyzing your resume...'), 3000),
        setTimeout(() => setLoadingMessage('AI is working hard! Hang tight...'), 12000),
        setTimeout(() => setLoadingMessage('Almost there! Just a moment...'), 20000),
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
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [isRedirect, navigate]);

  return (
    <main className='w-full h-full flex text-white max-md:flex-col scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-200'>
      <div className='basis-[50%] max-md:basis-[40%] max-md:border-b bg-gray-900 border-r border-gray-600 flex justify-center items-center flex-col p-6'>
        <Upload setShowButton={setShowButton} onChangeHandler={onChangeHandler} />
        {showButton && (
          <button
            disabled={isLoading}
            className={`mt-4 px-5 py-2 text-lg font-semibold rounded-lg transition-all duration-300 ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} cursor-pointer`}
            onClick={onSubmitHandler}
          >
            {isLoading ? <span className='loader'></span> : 'Check Your Resume'}
          </button>
        )}
      </div>
      <div className='basis-[50%] max-md:basis-[60%] bg-gray-950 p-6 overflow-y-auto pb-28'>
        <p className='text-center text-lg font-semibold bg-gray-700 py-3 rounded-md mb-6'>
          {responseData ? 'Resume Summary' : 'No review data yet.'}
        </p>
        {isLoading ? (
          <div className='w-full flex justify-center items-center text-xl font-semibold'>
            {loadingMessage}
          </div>
        ) : (
          <ResumeReviewPreview PreviewData={responseData} />
        )}
      </div>
    </main>
  );
};

export default Home;
