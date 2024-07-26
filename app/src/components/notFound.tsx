export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          404 - Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Sorry, the page you are looking for might not exist.
        </p>
        <div className="mt-8">
          <a
            href="/"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            Go back to the home page
          </a>
        </div>
      </div>
    </div>
  );
}
