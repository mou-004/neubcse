import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

          .home-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, #bbf7d0 0, transparent 35%),
              radial-gradient(circle at bottom right, #a7f3d0 0, transparent 35%),
              linear-gradient(135deg, #f0fdf4, #ffffff, #ecfdf5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          .home-card {
            width: 100%;
            max-width: 430px;
            min-height: 720px;
            background: rgba(255, 255, 255, 0.92);
            border-radius: 36px;
            padding: 34px 24px;
            text-align: center;
            box-shadow: 0 24px 60px rgba(15, 118, 110, 0.18);
            border: 1px solid rgba(22, 163, 74, 0.16);
            position: relative;
            overflow: hidden;
          }

          .top-glow {
            position: absolute;
            width: 220px;
            height: 220px;
            background: #dcfce7;
            border-radius: 50%;
            top: -90px;
            right: -70px;
            opacity: 0.8;
          }

          .content {
            position: relative;
            z-index: 2;
          }

          .logo-circle {
            width: 112px;
            height: 112px;
            margin: 10px auto 22px;
            border-radius: 34px;
            background: linear-gradient(135deg, #16a34a, #059669);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 54px;
            box-shadow: 0 18px 35px rgba(22, 163, 74, 0.35);
            transform: rotate(-6deg);
          }

          .logo-circle span {
            transform: rotate(6deg);
          }

          .app-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #dcfce7;
            color: #15803d;
            padding: 11px 20px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 14px;
            border: 1px solid #bbf7d0;
          }

          .title {
            margin: 28px 0 0;
            font-size: 38px;
            line-height: 46px;
            color: #0f172a;
            font-weight: 900;
            letter-spacing: -1px;
          }

          .start-btn {
            display: inline-block;
            margin-top: 30px;
            background: linear-gradient(135deg, #16a34a, #059669);
            color: white;
            border: none;
            padding: 16px 46px;
            border-radius: 20px;
            font-size: 17px;
            font-weight: 900;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 14px 28px rgba(22, 163, 74, 0.32);
          }

          .subtitle {
            margin: 30px auto 0;
            max-width: 340px;
            color: #475569;
            font-size: 16px;
            line-height: 28px;
          }

          .feature-row {
            margin-top: 34px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .feature {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 22px;
            padding: 16px 10px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          }

          .feature-icon {
            font-size: 26px;
          }

          .feature-text {
            margin-top: 8px;
            color: #334155;
            font-size: 13px;
            font-weight: 800;
          }

          .department-badge {
            margin-top: 34px;
            display: inline-block;
            background: #ffffff;
            color: #047857;
            padding: 12px 20px;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 900;
            border: 1px solid #bbf7d0;
            box-shadow: 0 12px 28px rgba(15, 118, 110, 0.10);
          }

          .university {
            margin-top: 22px;
            padding: 20px;
            border-radius: 26px;
            background: #0f172a;
            color: white;
          }

          .university small {
            color: #86efac;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .university h2 {
            margin: 8px 0 0;
            font-size: 22px;
            line-height: 30px;
          }

          @media (max-width: 480px) {
            .home-page {
              padding: 0;
              align-items: stretch;
            }

            .home-card {
              min-height: 100vh;
              border-radius: 0;
              max-width: none;
              box-shadow: none;
            }

            .title {
              font-size: 34px;
              line-height: 42px;
            }
          }
        `}
      </style>

      <div className="home-card">
        <div className="top-glow"></div>

        <div className="content">
          <div className="logo-circle">
            <span>🎓</span>
          </div>

          <div className="app-badge">
            <span>📘</span>
            <span>NEUB CSE Management</span>
          </div>

          <h1 className="title">Welcome to Your CSE Academic App</h1>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="start-btn"
          >
            Get Started
          </button>

          <p className="subtitle">
            NEUB CSE Management helps CSE students check notices, class
            routines, study materials, assignments, profile information, and
            payment updates from one simple app.
          </p>

          <div className="feature-row">
            <div className="feature">
              <div className="feature-icon">🔔</div>
              <div className="feature-text">Notices</div>
            </div>

            <div className="feature">
              <div className="feature-icon">📚</div>
              <div className="feature-text">Materials</div>
            </div>

            <div className="feature">
              <div className="feature-icon">📝</div>
              <div className="feature-text">Tasks</div>
            </div>
          </div>

          <div className="department-badge">
            Department of Computer Science & Engineering
          </div>

        {/* <div className="university">
            <small>UNIVERSITY</small>
            <h2>North East University Bangladesh</h2>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Home;