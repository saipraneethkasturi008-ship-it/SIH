import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="flex items-center justify-between px-6 py-4 border-b bg-white">

        <h1 className="text-2xl font-bold">
          Udyami Mitra
        </h1>

        <div className="flex gap-3">

          <Link
            to="/login"
            className="px-4 py-2"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Register
          </Link>

        </div>

      </nav>

      <section className="max-w-5xl mx-auto text-center px-6 py-24">

        <h2 className="text-5xl font-bold">
          Your Business Partner
          <br />
          <span className="text-blue-600">
            in Your Language
          </span>
        </h2>

        <p className="mt-6 text-xl text-gray-600">
          AI-powered business assistance for rural entrepreneurs.
        </p>

        <Link
          to="/register"
          className="inline-block mt-8 bg-blue-600 text-white px-8 py-4 rounded-xl"
        >
          Get Started
        </Link>

      </section>

    </div>
  );
}

export default Landing;