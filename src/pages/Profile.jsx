import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("neub_current_user"));

    if (!savedUser) {
      navigate("/login");
      return;
    }

    setUser(savedUser);
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <style>
        {`
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

          .page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, #bbf7d0 0, transparent 35%),
              radial-gradient(circle at bottom right, #a7f3d0 0, transparent 35%),
              linear-gradient(135deg, #f0fdf4, #ffffff, #ecfdf5);
            padding: 24px;
          }

          .container {
            max-width: 760px;
            margin: 0 auto;
          }

          .profile-card {
            background: white;
            border-radius: 32px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 18px 45px rgba(15, 118, 110, 0.14);
            border: 1px solid rgba(22, 163, 74, 0.14);
            transition: 0.25s ease;
          }

          .profile-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 24px 55px rgba(15, 118, 110, 0.22);
            border-color: #16a34a;
          }

          .top-actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 24px;
          }

          .nav-btn {
            border: none;
            padding: 12px 18px;
            border-radius: 15px;
            font-weight: 900;
            cursor: pointer;
          }

          .home-btn {
            background: #dcfce7;
            color: #15803d;
          }

          .dash-btn {
            background: #16a34a;
            color: white;
          }

          .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid #dcfce7;
          }

          .avatar-fallback {
            width: 120px;
            height: 120px;
            margin: 0 auto;
            border-radius: 50%;
            background: #dcfce7;
            color: #16a34a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: 900;
            border: 5px solid #bbf7d0;
          }

          .title {
            margin: 18px 0 6px;
            color: #0f172a;
            font-size: 32px;
            font-weight: 900;
          }

          .email {
            color: #64748b;
            margin: 0;
          }

          .role {
            display: inline-block;
            margin-top: 14px;
            background: #16a34a;
            color: white;
            padding: 8px 18px;
            border-radius: 999px;
            font-weight: 900;
            text-transform: capitalize;
          }

          .info-box {
            margin-top: 24px;
            background: #f8fafc;
            border-radius: 22px;
            padding: 18px;
            text-align: left;
            color: #475569;
            line-height: 30px;
          }

          .main-btn {
            margin-top: 22px;
            background: #16a34a;
            color: white;
            border: none;
            padding: 13px 22px;
            border-radius: 15px;
            font-weight: 900;
            cursor: pointer;
          }

          .main-btn:hover {
            background: #059669;
          }
        `}
      </style>

      <div className="container">
        <div className="top-actions">
          <button className="nav-btn home-btn" onClick={() => navigate("/")}>
            Home
          </button>

          <button
            className="nav-btn dash-btn"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>

        <div className="profile-card">
          {user.avatar ? (
            <img className="avatar" src={user.avatar} alt="Profile" />
          ) : (
            <div className="avatar-fallback">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <h1 className="title">{user.name || "User Name"}</h1>
          <p className="email">{user.email || "user@example.com"}</p>

          <span className="role">{user.role || "student"}</span>

          <div className="info-box">
            <div>ID: {user.userId || user.id || "Not provided"}</div>
            <div>Name: {user.name || "Not provided"}</div>
            <div>Email: {user.email || "Not provided"}</div>
            <div>Role: {user.role || "student"}</div>
          </div>

          <button className="main-btn" onClick={() => navigate("/dashboard")}>
            Update From Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;