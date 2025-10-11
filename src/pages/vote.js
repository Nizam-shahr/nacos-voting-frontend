import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';

const candidateImages = {
  'candidate111': '/images/candidates/candidate111.jpg',
  'candidate112': '/images/candidates/candidate112.jpg',
  'candidate113': '/images/candidates/candidate113.jpg',
  'candidate211': '/images/candidates/candidate211.jpg',
  'candidate212': '/images/candidates/candidate212.jpg',
  'candidate311': '/images/candidates/candidate311.jpg',
  'candidate312': '/images/candidates/candidate312.jpg',
  'candidate411': '/images/candidates/candidate411.jpg',
  'candidate412': '/images/candidates/candidate412.jpg'
};

const Vote = () => {
  const [positions, setPositions] = useState([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('User from localStorage:', parsedUser);
          setUser(parsedUser);
        } else {
          setError('No user session found. Please sign in.');
          router.push('/');
        }
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        setError('Failed to access session. Ensure browser storage is enabled.');
        router.push('/');
      }
    }
  }, [router]);

  useEffect(() => {
    if (!user || !user.institutionalEmail || !user.deviceId) {
      return;
    }

    const fetchPositions = async () => {
      try {
        const response = await axios.get('/api/positions');
        console.log('Positions fetched:', response.data);
        setPositions(response.data);
        if (user.remainingPositions && user.remainingPositions.length > 0) {
          fetchCandidates(user.remainingPositions[0]);
        }
      } catch (err) {
        console.error('Fetch positions error:', err);
        setError('Failed to load positions. Please try again.');
      }
    };

    fetchPositions();
  }, [user]);

  const fetchCandidates = async (position) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/candidates/${position}`);
      console.log(`Candidates for ${position}:`, response.data);
      setCandidates(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch candidates error:', err);
      setError('Failed to load candidates. Please try again.');
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting vote:', {
        institutionalEmail: user.institutionalEmail,
        candidateId: selectedCandidate,
        position: positions[currentPositionIndex],
        deviceId: user.deviceId
      });
      const response = await axios.post('/api/vote', {
        institutionalEmail: user.institutionalEmail,
        candidateId: selectedCandidate,
        position: positions[currentPositionIndex],
        deviceId: user.deviceId
      });
      console.log('Vote response:', response.data);

      const newRemainingPositions = user.remainingPositions.filter(
        pos => pos !== positions[currentPositionIndex]
      );

      const updatedUser = { ...user, remainingPositions: newRemainingPositions };
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        setError('Failed to update session. Ensure browser storage is enabled.');
        setLoading(false);
        return;
      }

      if (newRemainingPositions.length === 0) {
        await axios.post('/api/complete-voting', {
          institutionalEmail: user.institutionalEmail,
          deviceId: user.deviceId
        });
        router.push('/success');
      } else {
        setCurrentPositionIndex(currentPositionIndex + 1);
        setSelectedCandidate('');
        fetchCandidates(newRemainingPositions[0]);
      }
    } catch (err) {
      console.error('Vote error:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Failed to submit vote.');
      } else if (err.response?.status === 401) {
        setError('Invalid user or device. Please sign in again.');
        router.push('/');
      } else {
        setError('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center p-4">
      VOTING ENDED
    </div>
  );
};

export default Vote;