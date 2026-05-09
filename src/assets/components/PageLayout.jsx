import { useNavigate } from "react-router-dom";

const PageLayout = ({ title, subtitle, children }) => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

          .page-wrapper {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, #bbf7d0 0, transparent 35%),
              radial-gradient(circle at bottom right, #a7f3d0 0, transparent 35%),
              linear-gradient(135deg, #f0fdf4, #ffffff, #ecfdf5);
            padding: 24px;
          }

          .page-container {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
          }

          .page-topbar {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 28px;
            padding: 20px;
            box-shadow: 0 18px 45px rgba(15, 118, 110, 0.14);
            border: 1px solid rgba(22, 163, 74, 0.16);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 14px;
          }

          .page-title {
            margin: 0;
            color: #0f172a;
            font-size: 30px;
            font-weight: 900;
          }

          .page-subtitle {
            margin: 8px 0 0;
            color: #64748b;
            line-height: 24px;
          }

          .top-actions {
            display: flex;
            gap: 10px;
          }

          .nav-btn {
            border: none;
            border-radius: 15px;
            padding: 12px 16px;
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

          .content-area {
            margin-top: 24px;
          }

          .grid-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
          }

          .page-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 26px;
            padding: 22px;
            border: 1px solid rgba(22, 163, 74, 0.14);
            box-shadow: 0 14px 35px rgba(15, 118, 110, 0.10);
            transition: 0.25s ease;
          }

          .page-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 24px 55px rgba(15, 118, 110, 0.22);
            border-color: #16a34a;
          }

          .card-icon {
            width: 56px;
            height: 56px;
            border-radius: 18px;
            background: #dcfce7;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-bottom: 15px;
          }

          .card-title {
            margin: 0;
            color: #0f172a;
            font-size: 19px;
            font-weight: 900;
          }

          .card-text {
            color: #64748b;
            line-height: 24px;
            font-size: 14px;
          }

          .meta {
            display: inline-block;
            margin-top: 8px;
            background: #f0fdf4;
            color: #15803d;
            padding: 7px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 900;
          }

          .primary-btn {
            margin-top: 16px;
            background: linear-gradient(135deg, #16a34a, #059669);
            color: white;
            border: none;
            padding: 12px 18px;
            border-radius: 15px;
            font-weight: 900;
            cursor: pointer;
            transition: 0.2s ease;
          }

          .primary-btn:hover {
            transform: scale(1.04);
            box-shadow: 0 12px 25px rgba(22, 163, 74, 0.25);
          }

          .detail-box {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 30px;
            padding: 28px;
            box-shadow: 0 18px 45px rgba(15, 118, 110, 0.14);
            border: 1px solid rgba(22, 163, 74, 0.16);
          }

          .detail-title {
            margin: 0;
            color: #0f172a;
            font-size: 32px;
            font-weight: 900;
          }

          .detail-text {
            color: #475569;
            line-height: 30px;
            font-size: 16px;
          }

          @media (max-width: 850px) {
            .grid-list {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 560px) {
            .page-wrapper {
              padding: 14px;
            }

            .page-topbar {
              flex-direction: column;
              align-items: flex-start;
            }

            .top-actions {
              width: 100%;
            }

            .nav-btn {
              flex: 1;
            }

            .grid-list {
              grid-template-columns: 1fr;
            }

            .page-title {
              font-size: 25px;
            }
          }
        `}
      </style>

      <div className="page-container">
        <div className="page-topbar">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>

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
        </div>

        <div className="content-area">{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;