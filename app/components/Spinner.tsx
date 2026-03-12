export default function Spinner({ text = "Signing in..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      <span>{text}</span>
    </div>
  );
}