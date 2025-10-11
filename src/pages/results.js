import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PublicResults() {
  const [resultsData, setResultsData] = useState({
    voteCounts: {},
    totalValidVotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchVoteCounts();
  }, []);

  const fetchVoteCounts = async () => {
    try {
      const res = await fetch('/api/public/votes');
      const data = await res.json();
      if (res.ok) {
        setResultsData({ ...data, lastUpdated: new Date().toISOString() });
      } else {
        setError(data.error || 'Failed to load results');
      }
    } catch (err) {
      setError('Failed to fetch vote results');
    } finally {
      setLoading(false);
    }
  };

  const getWinner = (candidates) => {
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) return null;
    const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
    return sorted[0].votes > 0 ? sorted[0] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={128} height={128} className="mb-6 rounded-full" />
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
          </svg>
          <p className="mt-4 text-gray-600 text-lg">Loading election results...</p>
        </div>
      </div>
    );
  }

  const totalVotes = resultsData.totalValidVotes || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={80} height={80} className="rounded-full" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">NACOS 2025/2026 Election Results</h1>
                <p className="text-gray-600 mt-1">Live Vote Count - Transparent Results</p>
                {resultsData.lastUpdated && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date(resultsData.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 bg-blue-100 text-blue-800 py-3 px-4 rounded-lg shadow-md">
              <p className="text-sm font-semibold">Total Valid Votes</p>
              <p className="text-2xl font-bold">{totalVotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/votes-table')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 pulse"
          >
            View Votes Table
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 pulse"
          >
            Back to Home
          </button>
          <button
            onClick={fetchVoteCounts}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 pulse flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Results
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {!resultsData.voteCounts || Object.keys(resultsData.voteCounts).length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center fade-in">
              <div className="text-6xl mb-4">🗳️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Valid Votes Yet</h2>
              <p className="text-gray-600">Election results will appear here once valid votes are recorded.</p>
            </div>
          ) : (
            Object.entries(resultsData.voteCounts).map(([position, candidates]) => {
              const candidateArray = Array.isArray(candidates) ? candidates : [];
              const winner = getWinner(candidateArray);
              const totalPositionVotes = candidateArray.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);

              return (
                <div key={position} className="bg-white rounded-lg shadow-lg overflow-hidden fade-in">
                  <div className={`p-6 ${winner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border-b`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{position}</h2>
                        <p className="text-gray-600 mt-1">
                          {totalPositionVotes} valid vote{totalPositionVotes !== 1 ? 's' : ''} cast
                        </p>
                      </div>
                      {winner && (
                        <div className="mt-3 sm:mt-0 bg-green-100 text-green-800 py-2 px-4 rounded-full">
                          <span className="font-semibold">🏆 Leading: {winner.name}</span>
                          <span className="ml-2">({winner.votes} votes)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {candidateArray.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No candidates found for this position.</p>
                        </div>
                      ) : (
                        candidateArray.map((candidate, index) => {
                          const percentage = totalPositionVotes > 0
                            ? ((candidate.votes || 0) / totalPositionVotes) * 100
                            : 0;

                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg font-semibold text-gray-800">
                                    {candidate.name || 'Unknown Candidate'}
                                  </span>
                                  {winner && candidate.name === winner.name && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                                      LEADING
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-blue-600">
                                    {candidate.votes || 0}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 text-center fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">About These Results</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These results are updated in real-time and reflect only valid votes (completed voting sessions).
            The system ensures complete transparency in the NACOS 2025/2026 election process.
          </p>
          {resultsData.lastUpdated && (
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date(resultsData.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}