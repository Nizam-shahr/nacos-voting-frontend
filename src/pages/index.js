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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105">
       ELECTION SUSPENDED TILL FURTHER NOTICE
      </div>
    </div>
  );
}