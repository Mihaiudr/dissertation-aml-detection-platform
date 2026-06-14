import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  Search,
  LogOut,
  Info,
} from "lucide-react";

function Sidebar({ activePage, setActivePage, onLogout }) {
  const menuItems = [
    { id: "batch", label: "Load Dataset", icon: <Upload size={18} /> },
    { id: "alerts", label: "Review Alerts", icon: <ClipboardList size={18} /> },
    { id: "investigator", label: "Investigator", icon: <Search size={18} /> },
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "about", label: "About Us", icon: <Info size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <button className="brand" type="button" onClick={onLogout}>
        <span className="brand-mark app-brand-mark" aria-hidden="true">
          <i />
        </span>

        <div>
          <h2>AML Guard</h2>
          <span>Banking PoC</span>
        </div>
      </button>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? "active" : ""}
            onClick={() => setActivePage(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={onLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
