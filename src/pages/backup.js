'use client';

import { useState } from 'react';

const BackupComponent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const BACKEND_URL ='https://nacos-voting-backend-2ml5.onrender.com';

  const downloadBackup = async (endpoint, filename) => {
    setLoading(true);
    setMessage('Downloading backup...');
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error('Backup failed');
      }

      if (endpoint === '/api/backup/download') {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Handle JSON data display and download
        const data = await response.json();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      setMessage('✅ Backup downloaded successfully!');
    } catch (error) {
      console.error('Backup error:', error);
      setMessage('❌ Backup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkBackupStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/backup/status`);
      const data = await response.json();
      setMessage(`📊 Status: ${data.message} | Users: ${data.counts.users} | Votes: ${data.counts.votes} | Candidates: ${data.counts.candidates}`);
    } catch (error) {
      setMessage('❌ Cannot connect to backup service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📦 Election Data Backup
      </h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 flex items-center gap-2">
          ⚠️ <span className="font-semibold">Important:</span> Download backup before making any server changes. Data will be lost on redeploy.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => downloadBackup('/api/backup/download', `election-full-backup-${Date.now()}.json`)}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          💾 Download Full Backup
        </button>
        
        <button 
          onClick={() => downloadBackup('/api/backup/users', `election-users-${Date.now()}.json`)}
          disabled={loading}
          className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          👥 Users Only
        </button>
        
        <button 
          onClick={() => downloadBackup('/api/backup/votes-table', `election-votes-${Date.now()}.json`)}
          disabled={loading}
          className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          🗳️ Votes Table
        </button>
        
        <button 
          onClick={checkBackupStatus}
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          📊 Check Status
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-blue-600 font-semibold">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Processing...
          </div>
        </div>
      )}
      
      {message && (
        <div className={`p-4 rounded-lg text-center ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
          message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Backup URLs (for manual access):</h4>
        <div className="space-y-2">
          <div>
            <a 
              href={`${BACKEND_URL}/api/backup/download`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-sm bg-white px-3 py-1 rounded border border-gray-300 inline-block"
            >
              Download Full Backup
            </a>
          </div>
          <div>
            <a 
              href={`${BACKEND_URL}/api/backup/users`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-sm bg-white px-3 py-1 rounded border border-gray-300 inline-block"
            >
              Users Data
            </a>
          </div>
          <div>
            <a 
              href={`${BACKEND_URL}/api/backup/votes-table`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-sm bg-white px-3 py-1 rounded border border-gray-300 inline-block"
            >
              Votes Table
            </a>
          </div>
          <div>
            <a 
              href={`${BACKEND_URL}/api/backup/status`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-sm bg-white px-3 py-1 rounded border border-gray-300 inline-block"
            >
              System Status
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupComponent;