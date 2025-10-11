import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';

const candidateImages = {
  'candidate111': '/images/candidates/candidate111.jpg',
  'candidate112': '/images/candidates/candidate112.jpg',
  'candidate113': '/images/candidates/candidate113.jpg',
  'candidate211': '/images/candidates/candidate211.jpg',
  'candidate212': '/images/candidates/candidate212.jpg',
  'candidate311': '/images/candidates/candidate311.jpg',
  'candidate312': '/images/candidates/candidate312.jpg',
  'candidate411': '/images/candidates/candidate411.jpg',
  'candidate412': '/images/candidates/candidate412.jpg'
};

const Vote = () => {
  const [positions, setPositions] = useState([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('User from localStorage:', parsedUser);
          setUser(parsedUser);
        } else {
          setError('No user session found. Please sign in.');
          router.push('/');
        }
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        setError('Failed to access session. Ensure browser storage is enabled.');
        router.push('/');
      }
    }
  }, [router]);

  useEffect(() => {
    if (!user || !user.institutionalEmail || !user.deviceId) {
      return;
    }

    const fetchPositions = async () => {
      try {
        const response = await axios.get('https://nacos-voting-backend-2ml5.onrender.com/api/positions');
        console.log('Positions fetched:', response.data);
        setPositions(response.data);
        if (user.remainingPositions && user.remainingPositions.length > 0) {
          fetchCandidates(user.remainingPositions[0]);
        }
      } catch (err) {
        console.error('Fetch positions error:', err);
        setError('Failed to load positions. Please try again.');
      }
    };

    fetchPositions();
  }, [user]);

  const fetchCandidates = async (position) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://nacos-voting-backend-2ml5.onrender.com/api/candidates/${position}`);
      console.log(`Candidates for ${position}:`, response.data);
      setCandidates(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch candidates error:', err);
      setError('Failed to load candidates. Please try again.');
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting vote:', {
        institutionalEmail: user.institutionalEmail,
        candidateId: selectedCandidate,
        position: positions[currentPositionIndex],
        deviceId: user.deviceId
      });
      const response = await axios.post('https://nacos-voting-backend-2ml5.onrender.com/api/vote', {
        institutionalEmail: user.institutionalEmail,
        candidateId: selectedCandidate,
        position: positions[currentPositionIndex],
        deviceId: user.deviceId
      });
      console.log('Vote response:', response.data);

      const newRemainingPositions = user.remainingPositions.filter(
        pos => pos !== positions[currentPositionIndex]
      );

      const updatedUser = { ...user, remainingPositions: newRemainingPositions };
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        setError('Failed to update session. Ensure browser storage is enabled.');
        setLoading(false);
        return;
      }

      if (newRemainingPositions.length === 0) {
        await axios.post('https://nacos-voting-backend-2ml5.onrender.com/api/complete-voting', {
          institutionalEmail: user.institutionalEmail,
          deviceId: user.deviceId
        });
        router.push('/success');
      } else {
        setCurrentPositionIndex(currentPositionIndex + 1);
        setSelectedCandidate('');
        fetchCandidates(newRemainingPositions[0]);
      }
    } catch (err) {
      console.error('Vote error:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Failed to submit vote.');
      } else if (err.response?.status === 401) {
        setError('Invalid user or device. Please sign in again.');
        router.push('/');
      } else {
        setError('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl fade-in">
        <div className="flex justify-center mb-6">
          <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={100} height={100} className="rounded-full" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4">NACOS Election Voting</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-700 mb-6">Vote for {positions[currentPositionIndex]}</h2>
        {error && (
          <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
        )}
        {loading ? (
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
            </svg>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">No candidates found for {positions[currentPositionIndex]}. Please contact support.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map(candidate => (
              <div
                key={candidate.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 bg-white shadow-md hover:shadow-lg ${selectedCandidate === candidate.id ? 'border-blue-600 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400'}`}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <Image
                  src={candidateImages[candidate.id] || '/images/default-candidate.jpg'}
                  alt={candidate.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-medium text-gray-800 text-center">{candidate.name}</h3>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleVote}
          className={`mt-8 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 w-full sm:w-auto ${loading || !selectedCandidate ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 pulse'}`}
          disabled={loading || !selectedCandidate}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Vote'
          )}
        </button>
      </div>
    </div>
  );
};

export default Vote;