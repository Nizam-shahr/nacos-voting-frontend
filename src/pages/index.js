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
  const router = useRouter();

  useEffect(() => {
    // Generate device ID
    Fingerprint2.get((components) => {
      const deviceId = Fingerprint2.x64hash128(components.map((pair) => pair.value).join(), 31);
      setDeviceId(deviceId);
      console.log('Device ID:', deviceId);
    });
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

    setLoading(true);
    try {
      const res = await fetch('/api/sign-in', {
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={128} height={128} className="mb-4" />
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">NACOS Election Sign In</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="institutionalEmail">
              Institutional Email
            </label>
            <input
              type="email"
              name="institutionalEmail"
              value={formData.institutionalEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="2203sen001@alhikmah.edu.ng"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="personalEmail">
              Personal Email
            </label>
            <input
              type="email"
              name="personalEmail"
              value={formData.personalEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="example@gmail.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="matricNumber">
              Matric Number
            </label>
            <input
              type="text"
              name="matricNumber"
              value={formData.matricNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="22/03sen001"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="John Doe"
              required
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            This application uses device fingerprinting to ensure voting integrity. Your device information is used solely for this purpose.
          </p>
          <button
            type="submit"
            disabled={loading || !deviceId}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
              loading || !deviceId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}