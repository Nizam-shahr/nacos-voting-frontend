import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PublicVotesTable() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const res = await fetch('/api/public/all-votes');
      const data = await res.json();
      if (res.ok) {
        setVotes(data);
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
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
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
                <h1 className="text-2xl font-bold text-gray-800">Live Votes Table</h1>
                <p className="text-gray-600">Real-time voting activity - NACOS 2025/2026 Election</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-center">
              <div className="bg-blue-100 text-blue-800 py-2 px-4 rounded-lg">
                <p className="text-sm font-semibold">Total Votes</p>
                <p className="text-2xl font-bold">{votes.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/results')}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            View Results
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Back to Home
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
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Voter Email</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Matric Number</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Position</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Vote Time</th>
                </tr>
              </thead>
              <tbody>
                {votes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                      <div className="text-4xl mb-2">🗳️</div>
                      <p>No votes recorded yet</p>
                      <p className="text-sm mt-2">Be the first to vote!</p>
                    </td>
                  </tr>
                ) : (
                  votes.map((vote, index) => (
                    <tr 
                      key={vote.id} 
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        {vote.userEmail}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        {vote.matricNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        {vote.position}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        {formatTimestamp(vote.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {votes.length} vote{votes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}