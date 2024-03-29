import React from 'react';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import { Link as RouterLink} from 'react-router-dom';



function LoginPage() {
  return (
    <div className='grid h-screen w-full bg-white'>
        <div className='flex flex-col justify-center'>
            <form className='max-w-[400px] w-full mx-auto bg-white p-4'>
                <img className='mx-auto w-52' src={BloodFlowLogo} alt='/' />
                <div className='flex flex-col pb-2 mx-4 -mt-2'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='text' 
                    placeholder='Email'/>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='password' 
                    placeholder='Password'/>
                </div>
                <div className='mx-4  my-4'>
                    <button className='bg-[#ff0000] w-full rounded-md font-bold py-3 text-white'>Sign In</button>
                </div>
                <div className='flex justify-between my-5 mx-4'>
                    <p className='flex items-center'><input className='mr-2' type='checkbox'></input>Remember Me</p>
                    <p className='font-bold'><RouterLink to="/signup">Create an Account</RouterLink></p>
                </div>
            </form>
        </div>
    </div>
  );
}

export default LoginPage;