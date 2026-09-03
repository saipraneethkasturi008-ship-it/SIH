import { NavLink } from "react-router-dom";

function Sidebar() {

  const menuItems = [
    ["Dashboard", "/dashboard"],
    ["AI Assistant", "/assistant"],
    ["Calculator", "/calculator"],
    ["Sales", "/sales"],
    ["Expenses", "/expenses"],
    ["Marketing", "/marketing"],
    ["Government Schemes", "/schemes"],
    ["Profile", "/profile"],
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r p-4">

      <h1 className="text-2xl font-bold mb-8">
        Udyami Mitra
      </h1>

      <nav className="space-y-2">

        {menuItems.map(([name, path]) => (

          <NavLink
            key={path}
            to={path}
            className="block p-3 rounded-lg hover:bg-gray-100"
          >
            {name}
          </NavLink>

        ))}

      </nav>

    </aside>
  );
}

export default Sidebar;