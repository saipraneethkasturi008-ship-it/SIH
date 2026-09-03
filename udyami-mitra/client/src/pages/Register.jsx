function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <div className="mt-6">
          <label className="block mb-2">
            Name
          </label>

          <input
            type="text"
            className="w-full border rounded-lg p-3"
            placeholder="Your name"
          />
        </div>

        <div className="mt-4">
          <label className="block mb-2">
            Phone
          </label>

          <input
            type="tel"
            className="w-full border rounded-lg p-3"
            placeholder="Phone number"
          />
        </div>

        <div className="mt-4">
          <label className="block mb-2">
            Password
          </label>

          <input
            type="password"
            className="w-full border rounded-lg p-3"
            placeholder="Create password"
          />
        </div>

        <button className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg">
          Create Account
        </button>

      </div>

    </div>
  );
}

export default Register;