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
       VOTING ENDED
      </div>
    </div>
  );
};

export default SignIn;