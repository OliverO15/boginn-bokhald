import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Archery Club Bookkeeping & Administration</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/years"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Years & Programs</h2>
          <p className="text-gray-600">Manage years and configure program pricing</p>
        </Link>

        <Link
          href="/instructors"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Instructors</h2>
          <p className="text-gray-600">Manage instructors and hourly wages</p>
        </Link>

        <Link
          href="/program-types"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Program Types</h2>
          <p className="text-gray-600">Create and edit program type templates</p>
        </Link>

        <Link
          href="/registrations"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Registrations</h2>
          <p className="text-gray-600">Enter and track student registrations</p>
        </Link>

        <Link
          href="/dashboard"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Financial Dashboard</h2>
          <p className="text-gray-600">View revenue, costs, and profit margins</p>
        </Link>

        <Link
          href="/sessions"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sessions</h2>
          <p className="text-gray-600">Track training sessions and instructor hours</p>
        </Link>

        <Link
          href="/reports"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports</h2>
          <p className="text-gray-600">Generate monthly and seasonal reports</p>
        </Link>
      </div>
    </div>
  );
}
