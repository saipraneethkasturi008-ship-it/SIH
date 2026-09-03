function Onboarding() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow">

        <h1 className="text-3xl font-bold">
          Tell Us About Your Business
        </h1>

        <p className="text-gray-500 mt-2">
          This helps Udyami Mitra give personalized advice.
        </p>

        <div className="mt-6">

          <label className="block mb-2">
            Business Name
          </label>

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Example: Lakshmi Homemade Foods"
          />

        </div>

        <div className="mt-4">

          <label className="block mb-2">
            Business Category
          </label>

          <select className="w-full border rounded-lg p-3">
            <option>Food Products</option>
            <option>Tailoring</option>
            <option>Dairy</option>
            <option>Handicrafts</option>
            <option>Farming Products</option>
            <option>Small Shop</option>
            <option>Other</option>
          </select>

        </div>

        <div className="mt-4">

          <label className="block mb-2">
            Location
          </label>

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Village / District / State"
          />

        </div>

        <div className="mt-4">

          <label className="block mb-2">
            Main Product
          </label>

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Example: Mango Pickle"
          />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

          <div>

            <label className="block mb-2">
              Monthly Sales
            </label>

            <input
              type="number"
              className="w-full border rounded-lg p-3"
              placeholder="₹35,000"
            />

          </div>

          <div>

            <label className="block mb-2">
              Monthly Expenses
            </label>

            <input
              type="number"
              className="w-full border rounded-lg p-3"
              placeholder="₹22,000"
            />

          </div>

        </div>

        <button className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg">
          Create My Business
        </button>

      </div>

    </div>
  );
}

export default Onboarding;