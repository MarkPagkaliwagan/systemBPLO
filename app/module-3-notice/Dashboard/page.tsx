export default function DashboardPage() {
  const stats = [
    { label: "Total Active Violations", value: 5 },
    { label: "Notice 1", value: 2 },
    { label: "Notice 2", value: 1 },
    { label: "Notice 3", value: 1 },
    { label: "Cease and Desist", value: 1 },
  ];

  return (
    <div className="min-h-screen bg-white text-black p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-wide border-b-2 border-black pb-2">
          COMPLIANCE NOTICE MANAGEMENT system
        </h1>
        <p className="mt-2">
          Monitor violation stages, track deadlines, and resolve notices efficiently.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border-2 border-black rounded-xl p-6 hover:bg-black hover:text-white transition duration-300"
          >
            <p className="text-sm">{stat.label}</p>
            <p className="text-3xl font-bold mt-3">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}                                                                                                                                                                                                                                         