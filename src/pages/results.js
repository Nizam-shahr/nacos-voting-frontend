import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PublicResults() {
  const [resultsData, setResultsData] = useState({
    voteCounts: {},
    totalVotes: 0,
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchVoteCounts();
  }, []);

  const fetchVoteCounts = async () => {
    try {
      const res = await fetch(`/api/public/votes`);
      const data = await res.json();
      if (res.ok) {
        setResultsData(data);
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
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={128} height={128} className="mb-4" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading election results...</p>
        </div>
      </div>
    );
  }

  // Calculate total votes from voteCounts
  const totalVotes = resultsData.totalVotes || Object.values(resultsData.voteCounts || {}).reduce((sum, candidates) => 
    sum + (Array.isArray(candidates) ? candidates.reduce((candidateSum, candidate) => candidateSum + (candidate.votes || 0), 0) : 0), 0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={64} height={64} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">NACOS 2025/2026 Election Results</h1>
                <p className="text-gray-600">Live Vote Count - Transparent Results</p>
                {resultsData.lastUpdated && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date(resultsData.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-center">
              <div className="bg-blue-100 text-blue-800 py-2 px-4 rounded-lg">
                <p className="text-sm font-semibold">Total Votes Cast</p>
                <p className="text-2xl font-bold">{totalVotes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/votes-table')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Votes Table
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={fetchVoteCounts}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Results
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {!resultsData.voteCounts || Object.keys(resultsData.voteCounts).length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🗳️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Votes Yet</h2>
              <p className="text-gray-600">Election results will appear here once voting begins.</p>
            </div>
          ) : (
            Object.entries(resultsData.voteCounts).map(([position, candidates]) => {
              // Ensure candidates is an array
              const candidateArray = Array.isArray(candidates) ? candidates : [];
              const winner = getWinner(candidateArray);
              const totalPositionVotes = candidateArray.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);
              
              return (
                <div key={position} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Position Header */}
                  <div className={`p-6 ${winner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border-b`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{position}</h2>
                        <p className="text-gray-600 mt-1">
                          {totalPositionVotes} vote{totalPositionVotes !== 1 ? 's' : ''} cast
                        </p>
                      </div>
                      {winner && (
                        <div className="mt-3 md:mt-0 bg-green-100 text-green-800 py-2 px-4 rounded-full">
                          <span className="font-semibold">🏆 Leading: {winner.name}</span>
                          <span className="ml-2">({winner.votes} votes)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Candidates List */}
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
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                  <div className="text-2xl font-bold text-blue-600">
                                    {candidate.votes || 0}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
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

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About These Results</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These results are updated in real-time as votes are cast. The system ensures complete transparency 
              in the NACOS 2025/2026 election process. Results are automatically calculated and displayed 
              without any manual intervention.
            </p>
            {resultsData.lastUpdated && (
              <p className="text-sm text-gray-500 mt-4">
                Last updated: {new Date(resultsData.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}