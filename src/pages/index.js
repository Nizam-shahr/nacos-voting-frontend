import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Home() {
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [ipBlocked, setIpBlocked] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
  setLoading(true);
  setError('');
  setAlreadyVoted(false);
  setIpBlocked(false);
  
  if (!fullName.trim() || !personalEmail.trim() || !institutionalEmail.trim() || !matricNumber.trim()) {
    setError('Please fill in all required fields');
    setLoading(false);
    return;
  }

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 1);
  if (nameParts.length < 2) {
    setError('Please enter your complete first and last name');
    setLoading(false);
    return;
  }

  try {
    const res = await fetch(`/api/sign-in`, {  // Direct URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        institutionalEmail, 
        personalEmail, 
        matricNumber, 
        fullName 
      }),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      if (data.alreadyVoted) {
        setAlreadyVoted(true);
        setError('You have already completed voting for all positions.');
      } else {
        localStorage.setItem('user', JSON.stringify({ 
          institutionalEmail, 
          personalEmail: data.personalEmail,
          matricNumber,
          fullName: data.fullName,
          sessionToken: data.sessionToken,
          remainingPositions: data.remainingPositions 
        }));
        router.push('/vote');
      }
    } else {
      if (data.ipBlocked) {
        setIpBlocked(true);
        setError('This device/network has already been used for voting. Each device can only vote once.');
      } else {
        setError(data.error || 'Sign-in failed');
      }
    }
  } catch (err) {
    setError('Sign-in failed. Please check your connection.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={128} height={128} className="mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to NACOS 2025/2026 Election</h1>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Secure Sign In to Vote</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All fields are required for verification purposes.
          </p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-md ${
            alreadyVoted ? 'bg-blue-100 border border-blue-400 text-blue-700' : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {error}
            {alreadyVoted && (
              <div className="mt-2">
                <button
                  onClick={() => router.push('/results')}
                  className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700"
                >
                  View Results
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter your complete first and last name</p>
          </div>

          <div>
            <label htmlFor="institutionalEmail" className="block text-sm font-medium text-gray-700">
              Institutional Email *
            </label>
            <input
              type="email"
              id="institutionalEmail"
              value={institutionalEmail}
              onChange={(e) => setInstitutionalEmail(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2203sen001@alhikmah.edu.ng"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: 2203sen001@alhikmah.edu.ng</p>
          </div>

          <div>
            <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700">
              Personal Email *
            </label>
            <input
              type="email"
              id="personalEmail"
              value={personalEmail}
              onChange={(e) => setPersonalEmail(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@gmail.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Your active personal email address</p>
          </div>
          
          <div>
            <label htmlFor="matricNumber" className="block text-sm font-medium text-gray-700">
              Matric Number *
            </label>
            <input
              type="text"
              id="matricNumber"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="22/03sen001"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: 22/03sen001</p>
          </div>
          
          <button
            onClick={handleSignIn}
            disabled={loading || alreadyVoted}
            className={`w-full py-3 rounded-md text-white font-semibold transition-all duration-200 ${
              loading || alreadyVoted ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Verifying...' : alreadyVoted ? 'Already Voted' : 'Sign In to Vote'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Having issues? Contact NACOS Electoral Committee
          </p>
        </div>
      </div>

      {/* Public Results Link */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Want to see live election results?</p>
        <button
          onClick={() => router.push('/results')}
          className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-all duration-200"
        >
          View Live Results
        </button>
      </div>
    </div>
  );
}