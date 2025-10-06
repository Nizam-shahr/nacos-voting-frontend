export default function ThankYou() {
  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Thank You for Voting!</h2>
        <p className="text-gray-700 mb-6">Your vote has been successfully recorded.</p>
        <button
          onClick={() => localStorage.clear()}
          className="bg-primary text-white py-3 px-6 rounded-md hover:bg-blue-600 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}