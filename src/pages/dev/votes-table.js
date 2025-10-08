import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PublicVotesTable() {
  const [votesData, setVotesData] = useState({ 
    votes: [], 
    totalVotes: 0,
    validVotes: 0,
    invalidVotes: 0,
    sessionVotes: 0,
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

  // Calculate statistics
  const validPercentage = votesData.totalVotes > 0 
    ? ((votesData.validVotes / votesData.totalVotes) * 100).toFixed(1)
    : 0;
  
  const invalidPercentage = votesData.totalVotes > 0 
    ? ((votesData.invalidVotes / votesData.totalVotes) * 100).toFixed(1)
    : 0;
  
  const sessionPercentage = votesData.totalVotes > 0 
    ? ((votesData.sessionVotes / votesData.totalVotes) * 100).toFixed(1)
    : 0;

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
            <div className="mt-4 md:mt-0">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-100 text-blue-800 py-2 px-3 rounded-lg text-center">
                  <p className="text-xs font-semibold">Total Votes</p>
                  <p className="text-xl font-bold">{votesData.totalVotes}</p>
                </div>
                <div className="bg-green-100 text-green-800 py-2 px-3 rounded-lg text-center">
                  <p className="text-xs font-semibold">Valid Votes</p>
                  <p className="text-xl font-bold">{votesData.validVotes}</p>
                </div>
                <div className="bg-purple-100 text-purple-800 py-2 px-3 rounded-lg text-center">
                  <p className="text-xs font-semibold">Session Votes</p>
                  <p className="text-xl font-bold">{votesData.sessionVotes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Valid Votes Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">Valid Votes</h3>
                <p className="text-2xl font-bold text-green-600">{votesData.validVotes}</p>
                <p className="text-sm text-green-600">{validPercentage}% of total</p>
              </div>
              <div className="text-green-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Invalid Votes Card */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-800">Invalid Votes</h3>
                <p className="text-2xl font-bold text-red-600">{votesData.invalidVotes}</p>
                <p className="text-sm text-red-600">{invalidPercentage}% of total</p>
              </div>
              <div className="text-red-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Session Votes Card */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-800">Session Votes</h3>
                <p className="text-2xl font-bold text-purple-600">{votesData.sessionVotes}</p>
                <p className="text-sm text-purple-600">{sessionPercentage}% of total</p>
              </div>
              <div className="text-purple-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Vote Status Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Vote Status</h3>
                <p className="text-sm text-blue-600">
                  {votesData.validVotes === votesData.totalVotes ? (
                    <span className="font-bold">All votes are valid</span>
                  ) : (
                    <span>{votesData.invalidVotes} duplicate IP votes filtered</span>
                  )}
                </p>
              </div>
              <div className="text-blue-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Valid Votes: {votesData.validVotes}</span>
            <span>Session Votes: {votesData.sessionVotes}</span>
            <span>Invalid Votes: {votesData.invalidVotes}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 flex">
            <div 
              className="bg-green-500 h-4 rounded-l-full transition-all duration-500"
              style={{ width: `${validPercentage}%` }}
            ></div>
            <div 
              className="bg-purple-500 h-4 transition-all duration-500"
              style={{ width: `${sessionPercentage}%` }}
            ></div>
            <div 
              className="bg-red-500 h-4 rounded-r-full transition-all duration-500"
              style={{ width: `${invalidPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{validPercentage}% Valid</span>
            <span>{sessionPercentage}% Session</span>
            <span>{invalidPercentage}% Invalid</span>
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
                  <th className="py-3 px-4 text-left text-sm font-semibold">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">IP Address</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {votesData.votes && votesData.votes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 px-4 text-center text-gray-500">
                      <div className="text-4xl mb-2">🗳️</div>
                      <p className="text-lg font-medium">No votes recorded yet</p>
                      <p className="text-sm mt-2">Be the first to vote!</p>
                    </td>
                  </tr>
                ) : (
                  votesData.votes && votesData.votes.map((vote, index) => (
                    <tr 
                      key={vote.id} 
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } ${
                        vote.isValid ? 'hover:bg-gray-100' : 'hover:bg-red-50'
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-800 border-t font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                          {vote.userInstitutionalEmail || 'N/A'}
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
                        {vote.timestamp || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm border-t">
                        {vote.isValid ? (
                          <span className="bg-green-100 text-green-800 py-1 px-2 rounded-full text-xs font-medium">
                            ✅ VALID
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 py-1 px-2 rounded-full text-xs font-medium">
                            ❌ INVALID
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t font-mono text-xs">
                        {vote.ipAddress || 'N/A'}
                        {vote.isDuplicateIP && (
                          <div className="text-red-600 text-xs mt-1">Duplicate IP</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm border-t">
                        {vote.votingSession ? (
                          <span className="bg-purple-100 text-purple-800 py-1 px-2 rounded-full text-xs font-medium">
                            🆕 SESSION
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs font-medium">
                            LEGACY
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold">{votesData.votes ? votesData.votes.length : 0}</span> votes • 
              <span className="text-green-600 font-semibold ml-2">{votesData.validVotes} valid</span> • 
              <span className="text-purple-600 font-semibold ml-2">{votesData.sessionVotes} session</span> • 
              <span className="text-red-600 font-semibold ml-2">{votesData.invalidVotes} invalid</span>
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