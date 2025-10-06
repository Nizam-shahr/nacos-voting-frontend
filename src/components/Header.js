export default function Header() {
  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center">
        <img src="/logo.png" alt="Logo" className="h-10 mr-4" />
        <h1 className="text-2xl font-bold">School Voting Platform</h1>
      </div>
    </header>
  );
}