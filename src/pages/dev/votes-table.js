import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PublicVotesTable() {
  const [votesData, setVotesData] = useState({ 
    votes: [], 
    totalVotes: 0, 
    lastUpdated: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const res = await fetch(`/api/dev/votes-table`);
      const data = await res.json();
      if (res.ok) {
        setVotesData(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch votes');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firebase Timestamp
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleString();
    }
    
    // Handle string timestamp
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    
    // Handle number timestamp
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleString();
    }
    
    return 'Invalid Date';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={128} height={128} className="mb-4" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading votes table...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={64} height={64} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Voting Activity Log</h1>
                <p className="text-gray-600">Detailed voting records - NACOS 2025/2026 Election</p>
                {votesData.lastUpdated && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date(votesData.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-center">
              <div className="bg-blue-100 text-blue-800 py-2 px-4 rounded-lg">
                <p className="text-sm font-semibold">Total Votes Cast</p>
                <p className="text-2xl font-bold">{votesData.totalVotes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/results')}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            View Results Summary
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={fetchVotes}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Votes Table */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold">#</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Voter Email</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Position</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Candidate Voted For</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Vote Timestamp</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Raw Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {votesData.votes && votesData.votes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                      <div className="text-4xl mb-2">🗳️</div>
                      <p className="text-lg font-medium">No votes recorded yet</p>
                      <p className="text-sm mt-2">Be the first to vote!</p>
                    </td>
                  </tr>
                ) : (
                  votesData.votes && votesData.votes.map((vote, index) => (
                    <tr 
                      key={vote.id} 
                      className={index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}
                    >
                      <td className="py-3 px-4 text-sm text-gray-800 border-t font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                          {vote.userInstitutionalEmail || vote.userEmail || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs font-medium">
                          {vote.position}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t font-medium">
                        {vote.candidateName || 'Unknown Candidate'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        {formatTimestamp(vote.timestamp)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t font-mono text-xs">
                        {vote.timestamp ? 
                          (vote.timestamp.toDate ? 
                            vote.timestamp.toDate().toISOString() : 
                            String(vote.timestamp)
                          ) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold">{votesData.votes ? votesData.votes.length : 0}</span> vote{votesData.votes && votesData.votes.length !== 1 ? 's' : ''}
            </div>
            <div className="mt-2 sm:mt-0">
              <span className="bg-green-100 text-green-800 py-1 px-2 rounded text-xs">
                Live Data
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}