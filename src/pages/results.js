import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Results() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthorized) {
      fetchResults();
    }
  }, [isAuthorized]);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/public/');
      const data = await res.json();
      if (res.ok) {
        // Filter votes by valid institutionalEmail format (include 2024)
        const emailRegex = /^(22|23|24)03(ins|cmp|sen|cyb)(0[0-9][1-9]|[1-9][0-9]|100)@alhikmah\.edu\.ng$/i;
        const filteredResults = {};
        Object.keys(data.results).forEach(position => {
          filteredResults[position] = data.results[position].map(candidate => ({
            ...candidate,
            isEmailValid: emailRegex.test(candidate.userInstitutionalEmail || '')
          }));
        });
        setResults(filteredResults);
        setLoading(false);
      } else {
        setError(data.error || 'Failed to fetch results');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to fetch results');
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

  const totalValidVotes = Object.values(results).flat().reduce((sum, candidate) => {
    return sum + (candidate.isEmailValid && candidate.voteCount ? candidate.voteCount : 0);
  }, 0);

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
          <p className="mt-4 text-gray-600 text-lg">Loading election results...</p>
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Election Results</h1>
                <p className="text-gray-600 mt-1">NACOS 2025/2026 Election - Valid Votes Only</p>
                {results.lastUpdated && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date(results.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 bg-blue-100 text-blue-800 py-3 px-4 rounded-lg shadow-md">
              <p className="text-sm font-semibold">Total Valid Votes</p>
              <p className="text-2xl font-bold">{totalValidVotes}</p>
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
            View Voting Activity Log
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 pulse"
          >
            Back to Home
          </button>
          <button
            onClick={fetchResults}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 pulse flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-pulse">
            {error}
          </div>
        )}

        {Object.keys(results).sort().map(position => (
          <div key={position} className="mb-8 bg-white rounded-lg shadow-lg p-6 fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{position}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results[position].length === 0 ? (
                <p className="text-gray-500 col-span-full">No valid votes recorded for this position.</p>
              ) : (
                results[position].map(candidate => (
                  <div
                    key={candidate.id}
                    className={`bg-gray-50 border ${candidate.isEmailValid ? 'border-gray-200' : 'border-red-200'} rounded-lg p-4 flex items-center space-x-4 transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">
                        Votes: {candidate.isEmailValid ? candidate.voteCount : 0}
                        {!candidate.isEmailValid && (
                          <span className="ml-2 bg-red-100 text-red-800 py-1 px-2 rounded-full text-xs font-medium">
                            INVALID (Ineligible Voter)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 p-1 rounded mt-1">
                        Email: {candidate.userInstitutionalEmail || 'N/A'}
                      </p>
                    </div>
                    <div className={candidate.isEmailValid ? 'text-blue-500' : 'text-red-500'}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        {candidate.isEmailValid ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Total Valid Votes for {position}: {results[position].reduce((sum, c) => sum + (c.isEmailValid ? c.voteCount || 0 : 0), 0)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}