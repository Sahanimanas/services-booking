const CLASSES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-700",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${CLASSES[status] ?? ""}`}
    >
      {status}
    </span>
  );
}
