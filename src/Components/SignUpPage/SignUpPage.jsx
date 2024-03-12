import React, {useState} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";


function SignUpPage() {

  const [dateOfBirth, setDateOfBirth] = useState('');
  
  return (
    <div className='grid h-screen w-full bg-white'>
        <div className='flex flex-col justify-center'>
            <form className='max-w-[400px] w-full mx-auto bg-white p-4'>
                <img className='mx-auto w-60' src={BloodFlowLogo} alt='/' />
                <div className='flex flex-col pb-2 mx-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='text' 
                    placeholder='Full Name'/>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='number' 
                    placeholder='Health Number'/>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                  <DatePicker
                    className="border border-[#ff0000] w-full rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]"
                    selected={dateOfBirth}
                    onChange={date => setDateOfBirth(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                  />
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='text' 
                    placeholder='Email'/>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='password' 
                    placeholder='Password'/>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='password' 
                    placeholder='Confirm Password'/>
                </div>
                <div className='mx-4  my-3'>
                    <button className='bg-[#ff0000] w-full rounded-md font-bold py-3 text-white'>Create Account</button>
                </div>
            </form>
        </div>
    </div>
  );
}

export default SignUpPage;