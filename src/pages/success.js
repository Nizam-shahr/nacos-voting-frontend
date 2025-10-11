import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Success = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md sm:max-w-lg text-center fade-in">
        <div className="flex justify-center mb-6">
          <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={100} height={100} className="rounded-full" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Thank You for Voting!</h1>
        <p className="text-gray-600 mb-6">Your vote has been successfully recorded for the NACOS 2025/2026 Election.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/results')}
            className="py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 pulse"
          >
            View Results
          </button>
          <button
            onClick={() => router.push('/')}
            className="py-3 px-6 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 hover:scale-105 pulse"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;