import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Image src="/images/nacoss.jpg" alt="NACOS Logo" width={128} height={128} className="mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Vote Submitted Successfully</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-600 mb-6">
          Thank you for voting in the NACOS 2025/2026 Election. Your vote has been recorded.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/votes-table')}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-semibold"
          >
            View Live Votes Table
          </button>
          
          <button
            onClick={() => router.push('/results')}
            className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 font-semibold"
          >
            View Election Results
          </button>
          
          <Link href="/">
            <p className="inline-block w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200">
              Back to Home
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}