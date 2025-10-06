import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [voteCounts, setVoteCounts] = useState({});
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    const fetchVotes = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const res = await fetch('/api/admin/votes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setVoteCounts(data);
        } else {
          alert(data.error);
          router.push('/admin/login');
        }
      } catch (error) {
        alert('Failed to load data');
        router.push('/admin/login');
      }
      setLoading(false);
    };
    fetchVotes();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Admin Dashboard - Vote Counts</h2>
        {Object.keys(voteCounts).length === 0 ? (
          <p className="text-gray-700 text-center">No votes recorded yet.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(voteCounts).map(([position, candidates]) => (
              <div key={position}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{position}</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Candidate</th>
                      <th className="border p-3 text-right">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, index) => (
                      <tr key={index} className="border-b">
                        <td className="border p-3">{candidate.name}</td>
                        <td className="border p-3 text-right">{candidate.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            router.push('/admin/login');
          }}
          className="mt-6 bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}