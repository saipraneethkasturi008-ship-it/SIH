function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">

        <h1 className="text-3xl font-bold text-center">
          Udyami Mitra
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Your Business Partner in Your Language
        </p>

        <div className="mt-8">
          <label className="block mb-2">
            Email or Phone
          </label>

          <input
            type="text"
            className="w-full border rounded-lg p-3"
            placeholder="Enter email or phone"
          />
        </div>

        <div className="mt-4">
          <label className="block mb-2">
            Password
          </label>

          <input
            type="password"
            className="w-full border rounded-lg p-3"
            placeholder="Enter password"
          />
        </div>

        <button className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg">
          Login
        </button>

      </div>
    </div>
  );
}

export default Login;