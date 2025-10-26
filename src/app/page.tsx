import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-6">
          WebBuilder
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl">
          Build and manage Next.js applications with live preview and collaborative editing.
          Every project runs in its own secure E2B sandbox.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium text-lg"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white text-gray-900 px-8 py-3 rounded-md hover:bg-gray-100 font-medium text-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
