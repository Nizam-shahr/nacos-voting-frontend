import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PublicResults() {
  const [resultsData, setResultsData] = useState({
    voteCounts: {},
    totalValidVotes: 0,
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
      const res = await fetch('/api/public/votes');
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

  // Use totalValidVotes from backend
  const totalVotes = resultsData.totalValidVotes || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
     ELECTION SUSPENDED TILL FURTHER NOTICE
    </div>
  );
}