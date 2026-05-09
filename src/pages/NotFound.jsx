import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-3 text-xl">Page not found</p>
      <Link to="/" className="btn btn-primary mt-5">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;