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
  const [completingVoting, setCompletingVoting] = useState(false);
  const [tempVotes, setTempVotes] = useState({});
  const [slideDirection, setSlideDirection] = useState('slide-in');
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

    // Load temp votes from localStorage
    const savedTempVotes = localStorage.getItem('tempVotes');
    if (savedTempVotes) {
      setTempVotes(JSON.parse(savedTempVotes));
    }
  }, [router]);

  useEffect(() => {
    const currentPosition = positions[currentPositionIndex];
    
    if (currentPosition && user) {
      setCandidates([]);
      setCandidatesLoading(true);
      setSlideDirection('slide-in');
      
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

  const storeTempVote = (position, candidateId, candidateName) => {
    const newTempVotes = { ...tempVotes, [position]: { candidateId, candidateName } };
    setTempVotes(newTempVotes);
    localStorage.setItem('tempVotes', JSON.stringify(newTempVotes));
    return true;
  };

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
    const candidate = candidates.find(c => c.id === selectedCandidate);

    if (!candidate) {
      setError('Invalid candidate selected');
      setLoading(false);
      return;
    }

    // Store vote in backend
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionalEmail: user.institutionalEmail,
          sessionToken: user.sessionToken,
          candidateId: selectedCandidate,
          position
        })
      });
      
      if (res.ok) {
        // Store in local storage
        storeTempVote(position, selectedCandidate, candidate.name);
        setShowNext(true);
        setSelectedCandidate('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit vote');
      }
    } catch (err) {
      setError('Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  const finalizeAllVotes = async () => {
    if (!user) {
      setError('Session expired. Please sign in again.');
      router.push('/');
      return;
    }

    setCompletingVoting(true);
    setError('');

    try {
      const res = await fetch('/api/complete-voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionalEmail: user.institutionalEmail,
          sessionToken: user.sessionToken
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Success - clear local storage and redirect to success page
        localStorage.removeItem('user');
        localStorage.removeItem('tempVotes');
        router.push('/success');
      } else {
        if (data.duplicateIP) {
          setError(data.error);
          setTimeout(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('tempVotes');
            router.push('/');
          }, 3000);
        } else {
          setError(data.error || 'Failed to complete voting');
        }
      }
    } catch (err) {
      setError('Failed to complete voting. Please check your connection.');
    } finally {
      setCompletingVoting(false);
    }
  };

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setSlideDirection('slide-out');
      
      setTimeout(() => {
        setCurrentPositionIndex(currentPositionIndex + 1);
        setShowNext(false);
        setSelectedCandidate('');
        setError('');
        setSlideDirection('slide-in');
      }, 300);
    } else {
      // Last position completed - finalize all votes
      finalizeAllVotes();
    }
  };

  // Calculate voted positions count
  const votedPositionsCount = Object.keys(tempVotes).length;

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
      
      {/* Progress Circles */}
      <div className="mb-6">
        <div className="flex justify-center space-x-4">
          {positions.map((position, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                tempVotes[position]
                  ? 'bg-green-500 text-white'
                  : index === currentPositionIndex
                  ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {tempVotes[position] ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            Position {currentPositionIndex + 1} of {positions.length}
            {votedPositionsCount > 0 && ` • ${votedPositionsCount} completed`}
          </p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">Welcome, {user.fullName}</p>
        <p className="text-xs text-gray-500">{user.institutionalEmail}</p>
      </div>

      {/* Sliding Content */}
      <div className={`w-full max-w-md transition-all duration-300 transform ${
        slideDirection === 'slide-in' 
          ? 'translate-x-0 opacity-100' 
          : '-translate-x-full opacity-0'
      }`}>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Vote for {currentPosition || 'Loading...'}
          </h1>
          
          <p className="text-sm text-gray-600 mb-6 text-center">
            Select your preferred candidate for {currentPosition || 'the position'}.
          </p>
          
          {error && (
            <div className={`mb-4 p-3 rounded ${
              error.includes('already been used') || error.includes('IP address')
                ? 'bg-red-100 border border-red-400 text-red-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {error}
              {(error.includes('already been used') || error.includes('IP address')) && (
                <p className="text-sm mt-2">
                  Redirecting to home page...
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Candidate
              </label>
              <select
                value={selectedCandidate}
                onChange={(e) => {
                  setSelectedCandidate(e.target.value);
                  setError('');
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={showNext || loading || candidatesLoading || completingVoting}
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
                disabled={completingVoting}
                className={`w-full py-3 rounded-md text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  completingVoting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {completingVoting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finalizing Votes...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>
                      {currentPositionIndex < positions.length - 1 ? 'Next Position' : 'Finish Voting'}
                    </span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={handleVote}
                disabled={loading || !selectedCandidate || candidates.length === 0 || completingVoting}
                className={`w-full py-3 rounded-md text-white font-semibold transition-all duration-200 transform hover:scale-105 ${
                  loading || !selectedCandidate || candidates.length === 0 || completingVoting
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Storing Vote...
                  </div>
                ) : (
                  `Vote for ${currentPosition}`
                )}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{votedPositionsCount} of {positions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${(votedPositionsCount / positions.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Session Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 text-center">
              <strong>Session Voting:</strong> Your votes are stored temporarily. They will be finalized when you complete all positions.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Help */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          {positions.length - votedPositionsCount - 1} position(s) remaining after this
        </p>
      </div>
    </div>
  );
}