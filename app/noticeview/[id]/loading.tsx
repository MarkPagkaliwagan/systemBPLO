export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
        </div>

<h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
  Loading...
</h1>

<p className="mt-2 text-center text-sm text-slate-600">
  We’re preparing your notice form. This may take a moment.
</p>
      </div>
    </main>
  );
}