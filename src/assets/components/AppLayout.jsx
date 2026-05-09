import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("neub_current_user"));

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Notices", path: "/notices", icon: "🔔" },
    { name: "Class Routine", path: "/class-routine", icon: "📅" },
    { name: "Study Materials", path: "/study-materials", icon: "📚" },
    { name: "Assignments", path: "/assignments", icon: "📝" },
    { name: "Payment", path: "/payment", icon: "💳" },
    { name: "My Profile", path: "/profile", icon: "👤" },
  ];

  const logout = () => {
    localStorage.removeItem("neub_current_user");
    navigate("/");
  };

  return (
    <div className="app-layout">
      <style>
        {`
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

          .app-layout {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, #bbf7d0 0, transparent 35%),
              radial-gradient(circle at bottom right, #a7f3d0 0, transparent 35%),
              linear-gradient(135deg, #f0fdf4, #ffffff, #ecfdf5);
          }

          .top-nav {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(22, 163, 74, 0.15);
            padding: 14px 22px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .brand-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .hamburger {
            width: 46px;
            height: 46px;
            border: none;
            border-radius: 16px;
            background: #dcfce7;
            color: #15803d;
            font-size: 24px;
            font-weight: 900;
            cursor: pointer;
          }

          .brand-icon {
            width: 46px;
            height: 46px;
            border-radius: 16px;
            background: linear-gradient(135deg, #16a34a, #059669);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }

          .brand-title {
            margin: 0;
            font-size: 20px;
            color: #0f172a;
            font-weight: 900;
          }

          .brand-subtitle {
            margin: 2px 0 0;
            font-size: 13px;
            color: #64748b;
          }

          .user-area {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .user-pill {
            background: #f0fdf4;
            color: #15803d;
            padding: 9px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 900;
            text-transform: capitalize;
          }

          .logout-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 14px;
            font-weight: 900;
            cursor: pointer;
          }

          .side-menu {
            position: fixed;
            top: 0;
            left: ${open ? "0" : "-310px"};
            width: 290px;
            height: 100vh;
            background: white;
            z-index: 100;
            padding: 22px;
            box-shadow: 20px 0 55px rgba(15, 23, 42, 0.18);
            transition: 0.25s ease;
          }

          .menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 22px;
          }

          .menu-title {
            margin: 0;
            color: #0f172a;
            font-size: 22px;
            font-weight: 900;
          }

          .close-btn {
            border: none;
            background: #fee2e2;
            color: #dc2626;
            width: 38px;
            height: 38px;
            border-radius: 12px;
            font-weight: 900;
            cursor: pointer;
          }

          .menu-item {
            width: 100%;
            border: none;
            background: #f8fafc;
            color: #334155;
            padding: 15px;
            border-radius: 18px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 15px;
            font-weight: 900;
            cursor: pointer;
            transition: 0.2s ease;
            text-align: left;
          }

          .menu-item:hover {
            background: #16a34a;
            color: white;
            transform: translateX(6px);
          }

          .overlay {
            display: ${open ? "block" : "none"};
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.35);
            z-index: 80;
          }

          .main-content {
            padding: 24px;
          }

          @media (max-width: 600px) {
            .brand-title {
              font-size: 16px;
            }

            .brand-subtitle {
              display: none;
            }

            .user-pill {
              display: none;
            }

            .main-content {
              padding: 14px;
            }
          }
        `}
      </style>

      <div className="top-nav">
        <div className="brand-area">
          <button className="hamburger" onClick={() => setOpen(true)}>
            ☰
          </button>

          <div className="brand-icon">🎓</div>

          <div>
            <h1 className="brand-title">NEUB CSE Management</h1>
            <p className="brand-subtitle">North East University Bangladesh</p>
          </div>
        </div>

        <div className="user-area">
          <span className="user-pill">{user?.role || "guest"}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="overlay" onClick={() => setOpen(false)}></div>

      <aside className="side-menu">
        <div className="menu-header">
          <h2 className="menu-title">Menu</h2>
          <button className="close-btn" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        {menuItems.map((item) => (
          <button
            className="menu-item"
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setOpen(false);
            }}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default AppLayout;