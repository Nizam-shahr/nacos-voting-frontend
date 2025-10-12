import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { impersonateVotes } from '../components/impersonate.js';
import { votes as filteredVotes } from '../components/filtered_votes.js';
import { votes as possibleVoters } from '../components/votes.js';

const candidates = [
  { id: 'candidate111', name: 'Alowonle Olayinka Abdulrazzak', position: 'President' },
  { id: 'candidate112', name: 'Fadlullah Folajomi Babalola', position: 'President' },
  { id: 'candidate113', name: 'Buhari Muhammad Maaji', position: 'President' },
  { id: 'candidate211', name: 'Sadiq Fareedah Adedoyin', position: 'Vice President' },
  { id: 'candidate212', name: 'Abubakar Fatihu Olanrewaju', position: 'Vice President' },
  { id: 'candidate311', name: 'Sulayman Umar Toyin', position: 'Senate President' },
  { id: 'candidate312', name: 'Isah Ahmad', position: 'Senate President' },
  { id: 'candidate411', name: 'Surajo Umar Sadiq', position: 'Treasurer' },
  { id: 'candidate412', name: 'Abubakar Faruku Saad', position: 'Treasurer' }
];

const POSITIONS_COUNT = 4; // Number of positions: President, Vice President, Senate President, Treasurer

export default function CompareVotes() {
  const [votesData, setVotesData] = useState({
    votes: [],
    totalVotes: 0,
    validVotes: 0,
    invalidCounts: {},
    results: {},
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthorized) {
      compareVotes();
    }
  }, [isAuthorized]);

  const compareVotes = async () => {
    try {
      // Convert impersonateVotes to lowercase for case-insensitive comparison
      const lowerCaseImpersonateVotes = impersonateVotes.map(email => email.toLowerCase());

      // Process filtered votes with case-insensitive impersonate check
      const processedVotes = filteredVotes.map(vote => ({
        ...vote,
        userInstitutionalEmail: vote.email,
        isValid: lowerCaseImpersonateVotes.includes(vote.email.toLowerCase())
      }));

      // Calculate vote counts per candidate (only valid votes)
      const results = {};
      const invalidCounts = {};
      candidates.forEach(candidate => {
        if (!results[candidate.position]) {
          results[candidate.position] = [];
        }
        if (!invalidCounts[candidate.name]) {
          invalidCounts[candidate.name] = 0;
        }
        const validVoteCount = processedVotes.filter(
          vote => vote.candidate === candidate.name && vote.isValid
        ).length;
        const invalidVoteCount = processedVotes.filter(
          vote => vote.candidate === candidate.name && !vote.isValid
        ).length;
        results[candidate.position].push({
          id: candidate.id,
          name: candidate.name,
          voteCount: validVoteCount,
          invalidVoteCount: invalidVoteCount,
          isEmailValid: true
        });
        invalidCounts[candidate.name] = invalidVoteCount;
      });

      // Determine winners for each position based on valid votes
      Object.keys(results).forEach(position => {
        results[position].sort((a, b) => b.voteCount - a.voteCount);
        const maxVotes = results[position][0]?.voteCount || 0;
        results[position].forEach(candidate => {
          candidate.isWinner = candidate.voteCount === maxVotes && maxVotes > 0;
        });
      });

      const validVotes = processedVotes.filter(vote => vote.isValid).length;
      const totalVotes = processedVotes.length;

      setVotesData({
        votes: processedVotes,
        totalVotes,
        validVotes,
        invalidCounts,
        results,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to compare votes');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'nacos_admin_2025') {
      setIsAuthorized(true);
    } else {
      setError('Invalid password');
    }
  };

  const handleDownload = () => {
    // Prepare data for download, excluding isValid field
    const downloadData = {
      votes: votesData.votes.map(({ isValid, ...rest }) => rest),
      results: votesData.results,
      invalidCounts: votesData.invalidCounts,
      totalVotes: votesData.totalVotes,
      validVotes: votesData.validVotes,
      totalPossibleVoters: possibleVoters.length,
      totalPossibleVotes: possibleVoters.length * POSITIONS_COUNT,
      totalActualVoters: votesData.validVotes,
      totalActualVotes: votesData.validVotes * POSITIONS_COUNT,
      lastUpdated: votesData.lastUpdated
    };
    const dataStr = JSON.stringify(downloadData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compared_votes_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validPercentage = votesData.totalVotes > 0
    ? ((votesData.validVotes / votesData.totalVotes) * 100).toFixed(1)
    : 0;

  // Calculate new metrics
  const totalPossibleVoters = possibleVoters.length;
  const totalPossibleVotes = totalPossibleVoters * POSITIONS_COUNT;
  const totalActualVoters = votesData.validVotes;
  const totalActualVotes = totalActualVoters * POSITIONS_COUNT;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md sm:max-w-lg fade-in">
          <div className="flex justify-center mb-6">
            <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={100} height={100} className="rounded-full" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4">Admin Access</h1>
          {error && (
            <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 pulse"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={128} height={128} className="mb-6 rounded-full" />
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
          </svg>
          <p className="mt-4 text-gray-600 text-lg">Loading vote comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={80} height={80} className="rounded-full" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vote Comparison Log</h1>
                <p className="text-gray-600 mt-1">Comparison with impersonate votes - NACOS 2025/2026 Election</p>
                {votesData.lastUpdated && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date(votesData.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 bg-blue-100 text-blue-800 py-3 px-4 rounded-lg shadow-md">
              <p className="text-sm font-semibold">Total Valid Votes</p>
              <p className="text-2xl font-bold">{votesData.validVotes}</p>
            </div>
          </div>
          {/* New Metrics Display */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
              <p className="text-sm font-semibold text-gray-700">Total Possible Voters</p>
              <p className="text-2xl font-bold text-gray-800">{totalPossibleVoters}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
              <p className="text-sm font-semibold text-gray-700">Total Possible Votes</p>
              <p className="text-2xl font-bold text-gray-800">{totalPossibleVotes}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
              <p className="text-sm font-semibold text-gray-700">Total Actual Voters</p>
              <p className="text-2xl font-bold text-gray-800">{totalActualVoters}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
              <p className="text-sm font-semibold text-gray-700">Total Actual Votes</p>
              <p className="text-2xl font-bold text-gray-800">{totalActualVotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/votes-table')}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 pulse"
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
            onClick={compareVotes}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 pulse flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleDownload}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 hover:scale-105 pulse flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Results
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-md fade-in">
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
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6 fade-in">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Valid Votes: {votesData.validVotes}</span>
            <span>Total Votes: {votesData.totalVotes}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${validPercentage}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            <span>{validPercentage}% Valid</span>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {Object.keys(votesData.results).sort().map(position => (
          <div key={position} className="mb-8 bg-white rounded-lg shadow-lg p-6 fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{position}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {votesData.results[position].length === 0 ? (
                <p className="text-gray-500 col-span-full">No valid votes recorded for this position.</p>
              ) : (
                votesData.results[position].map(candidate => (
                  <div
                    key={candidate.id}
                    className={`bg-gray-50 border 'border-gray-200' rounded-lg p-4 flex flex-col space-y-2 transition-all duration-300 hover:shadow-md`}
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {candidate.name} 
                    </h3>
                    <p className="text-sm text-gray-600">Valid Votes: {candidate.voteCount}</p>
                    <p className="text-sm text-red-600">Invalid Votes: {candidate.invalidVoteCount}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Total Valid Votes for {position}: {votesData.results[position].reduce((sum, c) => sum + c.voteCount, 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Votes Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="bg-white rounded-lg shadow-lg p-6 fade-in">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-pulse">
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
                      key={index}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } ${
                        vote.isValid ? 'hover:bg-gray-100' : 'hover:bg-red-50'
                      } transition-all duration-300`}
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
                          {vote.position || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t font-medium">
                        {vote.candidate || 'Unknown Candidate'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 border-t">
                        {vote.timestamp ? new Date(vote.timestamp).toLocaleString() : 'N/A'}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold">{votesData.votes ? votesData.votes.length : 0}</span> votes •
              <span className="text-green-600 font-semibold ml-2">{votesData.validVotes} valid</span>
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