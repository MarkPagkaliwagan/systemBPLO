// File: app/module-2-inspection/components/page.tsx
interface StatCardProps {
  title: string;
  value: string | number;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="ml-80">
      <div className="bg-[#B3B3B3] rounded-[45px] p-6 flex flex-col items-center justify-center shadow-sm w-full h-50">
        <p className="text-gray-800 text-lg font-medium mb-2 capitalize">
          {title}
        </p>
        <h2 className="text-6xl font-bold text-black">
          {value}
        </h2>
      </div>
    </div>
  );
}