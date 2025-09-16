import React, { use } from 'react';
import Dashboard from './DashBoard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import homeimg from "../assets/homeimg.png";

function LandingPage() {
  const [userlogin, setUserLogin] = useState(false);
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  React.useEffect(() => {
    if (token) {
      setUserLogin(true);
    } else {
      setUserLogin(false);
    }
  }, [token])

  return (
    <>

      {
        !userlogin &&
        <div className=' bg-white w-screen h-screen flex justify-center items-center'>
          <div className='w-screen h-15 border-none flex justify-between px-12 py-6 text-black  absolute top-0 overflow-hidden 
          '>
            <img src="/logo.png" alt="Logo" className="w-10 h-10 " />
            <div className=' test-black'>
              <ul className="hidden md:flex gap-8 text-gray-500 font-medium">
                <li className="text-black pb-1">
                  Homepage
                </li>
                <li className="hover:text-black">About Us</li>
                <li className="hover:text-black">Main Menu</li>
                <li className="hover:text-black">Resources</li>
              </ul>
            </div>

            <div className='flex justify-between items-center  w-35'>
              <div className='font-bold '>Contact us </div>
              <button onClick={() => { nav("/users/login") }} className='bg-blue-600 w-10 h-10 flex items-center justify-center text-white rounded-sm'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>

              </button>
            </div>
          </div>
          <div>
            <img className=' inset-0 w-screen h-[300px]'
              src={homeimg}></img>
          </div>


          <div className='absolute bottom-20 w-screen border-none flex px-28 justify-between  h-50'>
            <div>
           <section className="relative z-10 text-left  w-auto  py-24">
            <h1 className="text-4xl  font-bold text-gray-900">
            Introducing our for you Telemedicine <br />
            Personalized Health AI
          </h1>
          <p className="text-lg text-gray-500 text-left  mt-6 max-w-2xl mx-auto">
            Powerful, self-serve product and growth analytics to help you
            convert, engage, and retain more users. Trusted by over 4,000
            startups.
          </p>
          </section>
          </div> 
            
            <div className=' relative w-70 rounded-lg p-2 bg-gray-900/5 mt-20 h-40 mr-10' onClick={()=>{nav("users/register")}}>  
              <span className='font-lightbold'>Try it for free </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-8
                absolute bottom-0 right-0 mb-2.5 mr-2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>

            </div>
        
          </div>

        </div>
      }
    </>

  );
}

export default LandingPage;