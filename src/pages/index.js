import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SignIn = () => {
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const VOTING_START_TIME = new Date('2025-10-11T12:00:00+01:00').getTime();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedDeviceId = localStorage.getItem('deviceId');
        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
        } else {
          const newDeviceId = 'device-' + Math.random().toString(36).substring(2);
          localStorage.setItem('deviceId', newDeviceId);
          setDeviceId(newDeviceId);
        }
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        setError('Failed to access device storage. Ensure browser storage is enabled.');
      }
    }
  }, []);

  useEffect(() => {
    const checkTime = () => {
      const now = Date.now();
      if (now < VOTING_START_TIME) {
        setError(`Voting starts at 12:00 PM WAT on October 11, 2025. Please wait.`);
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!institutionalEmail || !personalEmail || !matricNumber || !fullName || !deviceId) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/sign-in', {
        institutionalEmail,
        personalEmail,
        matricNumber,
        fullName,
        deviceId
      });

      if (response.data.alreadyVoted) {
        setError('You have already voted.');
        setLoading(false);
        return;
      }

      if (response.data.emailBlocked) {
        setError('This personal email has already been used by another student.');
        setLoading(false);
        return;
      }

      if (response.data.deviceBlocked) {
        setError('This device has already been used by another user.');
        setLoading(false);
        return;
      }

      try {
        localStorage.setItem('user', JSON.stringify({
          institutionalEmail: response.data.institutionalEmail,
          deviceId: response.data.deviceId,
          remainingPositions: response.data.remainingPositions,
          continueVoting: response.data.continueVoting
        }));
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        setError('Failed to store session. Ensure browser storage is enabled.');
        setLoading(false);
        return;
      }

      router.push('/vote');
    } catch (err) {
      console.error('Sign-in error:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Invalid input. Please check your details.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later or contact support.');
      } else {
        setError('Failed to connect to the server. Please check your network.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg p-6 sm:p-8 fade-in">
        <div className="flex justify-center mb-6">
          <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={100} height={100} className="rounded-full" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4">NACOS Election 2025/2026</h1>
        {error && (
          <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
        )}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Institutional Email</label>
            <input
              type="email"
              value={institutionalEmail}
              onChange={(e) => setInstitutionalEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="2203sen001@alhikmah.edu.ng"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Personal Email</label>
            <input
              type="email"
              value={personalEmail}
              onChange={(e) => setPersonalEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="example@gmail.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Matric Number</label>
            <input
              type="text"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="22/03sen001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="John Doe"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 pulse'}`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;