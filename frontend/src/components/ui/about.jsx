

import { Link } from "react-router-dom";

function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 text-gray-900">
      <h2 className="text-3xl font-bold mb-4">About Our Jewelry</h2>
      <p className="max-w-md text-center">
        This is a sample About page. Use it to start adding routes and components.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
export default About;

