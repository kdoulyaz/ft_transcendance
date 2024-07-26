
export function BadRequestPage ()  {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded-md">
        <h1 className="text-3xl font-semibold text-red-500 mb-4">
          Bad Request (400)
        </h1>
        <p className="text-gray-700">
          The server cannot or will not process the request due to an issue
          with the request itself.
        </p>
      </div>
    </div>
  );
};

export function ForbiddenPage() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 shadow-md rounded-md">
          <h1 className="text-3xl font-semibold text-red-500 mb-4">Forbidden (403)</h1>
          <p className="text-gray-700">
            You do not have permission to access this resource.
          </p>
        </div>
      </div>
    );
  };

  export function NotFound () {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 shadow-md rounded-md">
          <h1 className="text-3xl font-semibold text-red-500 mb-4">Not Found (404)</h1>
          <p className="text-gray-700">
            The page you are looking for could not be found.
          </p>
        </div>
      </div>
    );
  };

  export function ServerError(){
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 shadow-md rounded-md">
          <h1 className="text-3xl font-semibold text-red-500 mb-4">Server Error (500)</h1>
          <p className="text-gray-700">
            An internal server error occurred. Please try again later.
          </p>
        </div>
      </div>
    );
  };