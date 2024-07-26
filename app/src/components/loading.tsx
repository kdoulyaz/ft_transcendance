export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full border-t-4 border-blue-500 border-opacity-50 h-16 w-16"></div>
      <div className="ml-4 text-gray-700 dark:text-gray-300">Loading...</div>
    </div>
  );
}
