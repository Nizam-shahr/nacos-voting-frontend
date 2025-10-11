import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Fingerprint2 from 'fingerprintjs2';

// Map candidateId to image paths
const candidateImages = {
  candidate111: '/images/candidates/candidate111.jpg',
  candidate112: '/images/candidates/candidate112.jpg',
  candidate113: '/images/candidates/candidate113.jpg',
  candidate211: '/images/candidates/candidate211.jpg',
  candidate212: '/images/candidates/candidate212.jpg',
  candidate311: '/images/candidates/candidate311.jpg',
  candidate312: '/images/candidates/candidate312.jpg',
  candidate411: '/images/candidates/candidate411.jpg',
  candidate412: '/images/candidates/candidate412.jpg'
};

export default function Vote() {
  const [user, setUser] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [tempVotes, setTempVotes] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [completingVoting, setCompletingVoting] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(900); // 15 minutes in seconds
  const [sessionExpired, setSessionExpired] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [slideDirection, setSlideDirection] = useState('slide-in');
  const router = useRouter();

  useEffect(() => {
    // Generate device ID
    Fingerprint2.get((components) => {
      const deviceId = Fingerprint2.x64hash128(components.map((pair) => pair.value).join(), 31);
      setDeviceId(deviceId);
      console.log('Device ID:', deviceId);
    });

    // Load user from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(storedUser);

    // Load positions
    fetchPositions();
  }, [router]);

  useEffect(() => {
    // Start timer
    const timer = setInterval(() => {
      setSessionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionExpired(true);
          setError('Voting session has expired. Please sign in again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && positions.length > 0 && currentPositionIndex < positions.length) {
      fetchCandidates(positions[currentPositionIndex]);
    }
  }, [user, positions, currentPositionIndex]);

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/positions');
      const data = await res.json();
      if (res.ok) {
        const storedTempVotes = JSON.parse(localStorage.getItem('tempVotes') || '{}');
        const remainingPositions = data.filter(pos => !storedTempVotes[pos]);
        setPositions(remainingPositions);
        setTempVotes(storedTempVotes);
      } else {
        setError(data.error || 'Failed to load positions');
      }
    } catch (err) {
      setError('Failed to fetch positions');
    }
  };

  const fetchCandidates = async (position) => {
    setCandidatesLoading(true);
    try {
      const res = await fetch(`/api/candidates/${position}`);
      const data = await res.json();
      if (res.ok) {
        // Add image path to each candidate
        const candidatesWithImages = data.map(candidate => ({
          ...candidate,
          image: candidateImages[candidate.id] || '/images/placeholder.jpg'
        }));
        setCandidates(candidatesWithImages);
      } else {
        setError(data.error || 'Failed to load candidates');
      }
    } catch (err) {
      setError('Failed to fetch candidates');
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate || sessionExpired) return;

    setLoading(true);
    try {
      console.log('Submitting vote:', { institutionalEmail: user.institutionalEmail, candidateId: selectedCandidate, position: positions[currentPositionIndex], deviceId });
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionalEmail: user.institutionalEmail,
          sessionToken: user.sessionToken,
          candidateId: selectedCandidate,
          position: positions[currentPositionIndex],
          deviceId
        })
      });
      const data = await res.json();
      console.log('Vote response:', data);

      if (res.ok) {
        const candidate = candidates.find(c => c.id === selectedCandidate);
        const newTempVotes = {
          ...tempVotes,
          [positions[currentPositionIndex]]: {
            candidateId: selectedCandidate,
            candidateName: candidate.name
          }
        };
        setTempVotes(newTempVotes);
        localStorage.setItem('tempVotes', JSON.stringify(newTempVotes));
        setShowNext(true);
      } else {
        setError(data.error || 'Failed to submit vote');
      }
    } catch (err) {
      setError('Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPosition = () => {
    setSlideDirection('slide-out');
    setTimeout(() => {
      setCurrentPositionIndex(currentPositionIndex + 1);
      setSelectedCandidate(null);
      setShowNext(false);
      setSlideDirection('slide-in');
    }, 300);
  };

  const handleCompleteVoting = async () => {
    setCompletingVoting(true);
    try {
      const res = await fetch('/api/complete-voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionalEmail: user.institutionalEmail,
          sessionToken: user.sessionToken,
          deviceId
        })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem('tempVotes');
        localStorage.removeItem('user');
        router.push('/success');
      } else {
        setError(data.error || 'Failed to complete voting');
      }
    } catch (err) {
      setError('Failed to complete voting');
    } finally {
      setCompletingVoting(false);
    }
  };

  if (!user || sessionExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all hover:scale-105">
          <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={100} height={100} className="mx-auto mb-6 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {sessionExpired ? 'Session Expired' : 'Please Sign In'}
          </h2>
          <p className="text-gray-600 mb-6">
            {sessionExpired ? 'Your voting session has expired. Please sign in again.' : 'You need to sign in to vote.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all hover:scale-105">
          <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={100} height={100} className="mx-auto mb-6 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Positions Available</h2>
          <p className="text-gray-600 mb-6">You have already voted for all positions or no positions are available.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white shadow-lg rounded-b-2xl">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={80} height={80} className="rounded-full" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">NACOS 2025/2026 Election</h1>
              <p className="text-gray-600">Cast your vote for {positions[currentPositionIndex]}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <p className="text-sm font-semibold text-gray-600">Time left: {Math.floor(sessionTimer / 60)}:{sessionTimer % 60 < 10 ? '0' + sessionTimer % 60 : sessionTimer % 60}</p>
            <p className="text-sm text-gray-500">Position {currentPositionIndex + 1} of {positions.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-pulse">
            {error}
          </div>
        )}

        <div className={`transition-all duration-300 ${slideDirection}`}>
          <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:scale-101">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Select a candidate for {positions[currentPositionIndex]}
            </h2>
            {candidatesLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading candidates...</p>
              </div>
            ) : candidates.length === 0 ? (
              <p className="text-gray-600 text-center">No candidates available for this position.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedCandidate === candidate.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCandidate(candidate.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        src={candidate.image}
                        alt={candidate.name}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
                        <p className="text-gray-600 text-sm">{candidate.description || 'No description available'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
          >
            Back to Home
          </button>
          <div className="space-x-4">
            {showNext ? (
              currentPositionIndex < positions.length - 1 ? (
                <button
                  onClick={handleNextPosition}
                  className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                >
                  Next Position
                </button>
              ) : (
                <button
                  onClick={handleCompleteVoting}
                  disabled={completingVoting || sessionExpired}
                  className={`bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 ${
                    completingVoting || sessionExpired ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {completingVoting ? 'Completing...' : 'Complete Voting'}
                </button>
              )
            ) : (
              <button
                onClick={handleVote}
                disabled={!selectedCandidate || loading || candidatesLoading || sessionExpired}
                className={`bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 ${
                  !selectedCandidate || loading || candidatesLoading || sessionExpired ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Vote'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}