import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Vote() {
  const [positions, setPositions] = useState([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [user, setUser] = useState(null);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!userData.institutionalEmail || !userData.sessionToken) {
      router.push('/');
      return;
    }
    setUser(userData);

    if (userData.remainingPositions && userData.remainingPositions.length > 0) {
      setPositions(userData.remainingPositions);
    } else {
      fetch('/api/positions')
        .then(res => res.json())
        .then(data => setPositions(data))
        .catch(err => setError('Failed to load positions'));
    }
  }, [router]);

  useEffect(() => {
    const currentPosition = positions[currentPositionIndex];
    
    if (currentPosition && user) {
      setCandidates([]);
      setCandidatesLoading(true);
      
      fetch(`/api/candidates/${encodeURIComponent(currentPosition)}`)
        .then(res => res.json())
        .then(data => {
          setCandidates(data);
          setCandidatesLoading(false);
        })
        .catch(err => {
          setError('Failed to load candidates');
          setCandidatesLoading(false);
        });
    }
  }, [positions, currentPositionIndex, user]);

  const handleVote = async () => {
    if (!user) {
      setError('Session expired. Please sign in again.');
      router.push('/');
      return;
    }

    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setLoading(true);
    setError('');
    const position = positions[currentPositionIndex];

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          institutionalEmail: user.institutionalEmail,
          sessionToken: user.sessionToken,
          candidateId: selectedCandidate,
          position: position
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowNext(true);
        setSelectedCandidate('');
        
        const updatedUser = {
          ...user,
          remainingPositions: user.remainingPositions ? 
            user.remainingPositions.filter(pos => pos !== position) : 
            positions.filter(pos => pos !== position)
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        if (data.error && data.error.includes('Session expired')) {
          localStorage.removeItem('user');
          router.push('/');
        } else {
          setError(data.error || 'Vote submission failed');
        }
      }
    } catch (err) {
      setError('Vote submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
      setShowNext(false);
      setSelectedCandidate('');
      setError('');
    } else {
      localStorage.removeItem('user');
      router.push('/success');
    }
  };

  const currentPosition = positions[currentPositionIndex];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={128} height={128} className="mb-4" />
      
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">Welcome, {user.fullName}</p>
        <p className="text-xs text-gray-500">
          Position {currentPositionIndex + 1} of {positions.length}
        </p>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Vote for {currentPosition || 'Loading...'}
      </h1>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <p className="text-sm text-gray-600 mb-4">
          Select your preferred candidate for {currentPosition || 'the position'}.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Candidate</label>
            <select
              value={selectedCandidate}
              onChange={(e) => {
                setSelectedCandidate(e.target.value);
                setError('');
              }}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={showNext || loading || candidatesLoading}
            >
              <option value="">
                {candidatesLoading ? 'Loading candidates...' : 'Choose a candidate'}
              </option>
              {candidates.map(candidate => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </div>
          
          {showNext ? (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-md text-white font-semibold bg-green-600 hover:bg-green-700 transition-all duration-200"
            >
              {currentPositionIndex < positions.length - 1 ? 'Next Position' : 'Finish Voting'}
            </button>
          ) : (
            <button
              onClick={handleVote}
              disabled={loading || !selectedCandidate || candidates.length === 0}
              className={`w-full py-3 rounded-md text-white font-semibold transition-all duration-200 ${
                loading || !selectedCandidate || candidates.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Submitting...' : `Vote for ${currentPosition}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}