import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Fingerprint2 from 'fingerprintjs2';

export default function SignIn() {
  const [formData, setFormData] = useState({
    institutionalEmail: '',
    personalEmail: '',
    matricNumber: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Generate device ID
    Fingerprint2.get((components) => {
      const deviceId = Fingerprint2.x64hash128(components.map((pair) => pair.value).join(), 31);
      setDeviceId(deviceId);
      console.log('Device ID:', deviceId);
    });

    // Countdown to October 11, 2025, 12:00 PM WAT (UTC+1)
    const votingStartTime = new Date('2025-10-11T12:00:00+01:00').getTime(); // 1760238000000 ms
    const updateCountdown = () => {
      const now = new Date().getTime();
      const timeLeft = votingStartTime - now;

      if (timeLeft <= 0) {
        setIsVotingOpen(true);
        setCountdown('Voting is now open!');
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setCountdown(`Voting starts in ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceId) {
      setError('Device identification failed. Please try again.');
      return;
    }
    if (!isVotingOpen) {
      setError('Voting has not started yet. Please wait until 12:00 PM WAT.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://nacos-voting-backend-2ml5.onrender.com/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, deviceId })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify({
          institutionalEmail: data.institutionalEmail,
          personalEmail: data.personalEmail,
          matricNumber: data.matricNumber,
          fullName: data.fullName,
          sessionToken: data.sessionToken
        }));
        router.push('/vote');
      } else {
        setError(data.error || 'Failed to sign in');
      }
    } catch (err) {
      setError('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105">
        <div className="flex justify-center mb-6">
          <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={100} height={100} className="rounded-full" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">NACOS 2025/2026 Election</h1>
        <div className="text-center mb-6">
          <p className={`text-lg font-semibold ${isVotingOpen ? 'text-green-600' : 'text-gray-600'}`}>
            {countdown}
          </p>
        </div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-pulse">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="institutionalEmail">
              Institutional Email
            </label>
            <input
              type="email"
              name="institutionalEmail"
              value={formData.institutionalEmail}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="2203sen001@alhikmah.edu.ng"
              required
              disabled={!isVotingOpen}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="personalEmail">
              Personal Email
            </label>
            <input
              type="email"
              name="personalEmail"
              value={formData.personalEmail}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="example@gmail.com"
              required
              disabled={!isVotingOpen}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="matricNumber">
              Matric Number
            </label>
            <input
              type="text"
              name="matricNumber"
              value={formData.matricNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="22/03sen001"
              required
              disabled={!isVotingOpen}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="John Doe"
              required
              disabled={!isVotingOpen}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !deviceId || !isVotingOpen}
            className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 ${
              loading || !deviceId || !isVotingOpen ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}