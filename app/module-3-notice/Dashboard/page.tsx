export default function DashboardPage() {
  const stats = [
    { label: "Total Active Violations", value: 5 },
    { label: "Notice 1", value: 2 },
    { label: "Notice 2", value: 1 },
    { label: "Notice 3", value: 1 },
    { label: "Cease and Desist", value: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl text-black font-bold tracking-wide">
          COMPLIANCE NOTICE MANAGEMENT
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor violation stages, track deadlines, and resolve notices efficiently.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold mt-3">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}