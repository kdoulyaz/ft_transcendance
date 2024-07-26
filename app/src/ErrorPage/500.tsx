const renderServerErrorPage = () => {
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
  
  export default renderServerErrorPage;
  