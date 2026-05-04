import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Activate = () => {
  // Grab the uid and token from the URL
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const verifyAccount = async () => {
    setLoading(true);
    try {
      // Djoser's default endpoint for verifying the email link
      await axios.post('http://localhost:8000/auth/users/activation/', {
        uid: uid,
        token: token,
      });
      
      setStatus('success');
      
      // Redirect to login with a success message in the URL
      setTimeout(() => {
        navigate('/login?message=activated');
      }, 3000);
      
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Activation</h2>
        
        {status === 'idle' && (
          <>
            <p className="text-gray-600 mb-6">
              Thank you for joining our Enrollment System! Click the button below to verify your email and activate your account.
            </p>
            <button
              onClick={verifyAccount}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify My Account'
              )}
            </button>
          </>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded text-left">
              <p className="font-bold text-lg">Account Verified!</p>
              <p className="text-sm mt-1">Your account is now active. Redirecting you to the login page...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-left">
              <p className="font-bold text-lg">Activation Failed</p>
              <p className="text-sm mt-1">This link may be expired or already used. Please try registering again or contact support.</p>
            </div>
            <button 
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Back to Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activate;