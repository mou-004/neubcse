import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase.config.js";

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [counts, setCounts] = useState({
    notices: 0,
    assignments: 0,
    studyMaterials: 0,
    classRoutines: 0,
    payments: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          localStorage.removeItem("neub_current_user");
          navigate("/login");
          return;
        }

        await firebaseUser.reload();

        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          localStorage.removeItem("neub_current_user");
          alert("Please verify your email first.");
          navigate("/login");
          return;
        }

        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await signOut(auth);
          localStorage.removeItem("neub_current_user");
          alert("User profile not found.");
          navigate("/login");
          return;
        }

        const userData = userSnap.data();

        const loggedUser = {
          uid: firebaseUser.uid,
          userId: userData.userId || "",
          name: userData.name || firebaseUser.displayName || "User",
          email: firebaseUser.email,
          avatar: userData.avatar || firebaseUser.photoURL || "",
          role: userData.role || "student",
          emailVerified: firebaseUser.emailVerified,
        };

        localStorage.setItem("neub_current_user", JSON.stringify(loggedUser));

        setUser(loggedUser);
        setName(loggedUser.name);
        setAvatar(loggedUser.avatar);
      } catch (error) {
        console.error(error);
        alert(error.message);
        navigate("/login");
      } finally {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const unsubNotices = onSnapshot(collection(db, "notices"), (snapshot) => {
      setCounts((prev) => ({ ...prev, notices: snapshot.size }));
    });

    const unsubAssignments = onSnapshot(collection(db, "assignments"), (snapshot) => {
      setCounts((prev) => ({ ...prev, assignments: snapshot.size }));
    });

    const unsubMaterials = onSnapshot(collection(db, "studyMaterials"), (snapshot) => {
      setCounts((prev) => ({ ...prev, studyMaterials: snapshot.size }));
    });

    const unsubRoutine = onSnapshot(collection(db, "classRoutines"), (snapshot) => {
      setCounts((prev) => ({ ...prev, classRoutines: snapshot.size }));
    });

    const unsubPayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      setCounts((prev) => ({ ...prev, payments: snapshot.size }));
    });

    return () => {
      unsubNotices();
      unsubAssignments();
      unsubMaterials();
      unsubRoutine();
      unsubPayments();
    };
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!auth.currentUser || !user) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    try {
      setSaving(true);

      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: avatar || "",
      });

      await updateDoc(doc(db, "users", user.uid), {
        name,
        avatar,
      });

      const updatedUser = {
        ...user,
        name,
        avatar,
      };

      localStorage.setItem("neub_current_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      alert("Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("neub_current_user");
    navigate("/");
  };

  if (checking) {
    return (
      <div className="dashboard-loading">
        <style>
          {`
            .dashboard-loading {
              min-height: 70vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
            }

            .loading-card {
              background: white;
              padding: 30px;
              border-radius: 24px;
              box-shadow: 0 18px 45px rgba(15, 118, 110, 0.14);
              text-align: center;
            }

            .loading-card h2 {
              margin: 0 0 8px;
              color: #0f172a;
            }

            .loading-card p {
              margin: 0;
              color: #64748b;
            }
          `}
        </style>

        <div className="loading-card">
          <h2>Checking dashboard...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalUpdates =
    counts.notices +
    counts.assignments +
    counts.studyMaterials +
    counts.classRoutines +
    counts.payments;

  const countCards = [
    {
      title: "Notices",
      count: counts.notices,
      icon: "🔔",
      path: "/notices",
    },
    {
      title: "Assignments",
      count: counts.assignments,
      icon: "📝",
      path: "/assignments",
    },
    {
      title: "Study Materials",
      count: counts.studyMaterials,
      icon: "📚",
      path: "/study-materials",
    },
    {
      title: "Class Routine",
      count: counts.classRoutines,
      icon: "📅",
      path: "/class-routine",
    },
    {
      title: "Payments",
      count: counts.payments,
      icon: "💳",
      path: "/payment",
    },
  ];

  return (
    <div className="dashboard-page">
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

          .dashboard-page {
            min-height: 100vh;
            padding: 24px;
            background:
              radial-gradient(circle at top left, rgba(187, 247, 208, 0.7), transparent 36%),
              radial-gradient(circle at bottom right, rgba(167, 243, 208, 0.8), transparent 36%),
              linear-gradient(135deg, #f0fdf4, #ffffff, #ecfdf5);
          }

          .dashboard-container {
            max-width: 1100px;
            margin: 0 auto;
          }

          .summary-card {
            background: linear-gradient(135deg, #16a34a, #059669);
            color: white;
            border-radius: 30px;
            padding: 28px;
            box-shadow: 0 24px 55px rgba(22, 163, 74, 0.25);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          .summary-title {
            margin: 0;
            font-size: 34px;
            font-weight: 900;
          }

          .summary-text {
            margin: 8px 0 0;
            color: #dcfce7;
            line-height: 26px;
          }

          .total-box {
            background: white;
            color: #15803d;
            border-radius: 24px;
            padding: 20px 28px;
            min-width: 170px;
            text-align: center;
          }

          .total-number {
            margin: 0;
            font-size: 42px;
            font-weight: 900;
          }

          .total-label {
            margin: 4px 0 0;
            font-weight: 900;
          }

          .section-title {
            margin: 26px 0 14px;
            color: #0f172a;
            font-size: 24px;
            font-weight: 900;
          }

          .count-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
            gap: 16px;
          }

          .count-card {
            background: white;
            border: 1px solid rgba(22, 163, 74, 0.14);
            border-radius: 24px;
            padding: 22px;
            box-shadow: 0 14px 34px rgba(15, 118, 110, 0.1);
            cursor: pointer;
            transition: 0.25s ease;
          }

          .count-card:hover {
            transform: translateY(-7px);
            border-color: #16a34a;
            box-shadow: 0 24px 50px rgba(15, 118, 110, 0.18);
            background: #f0fdf4;
          }

          .count-icon {
            width: 54px;
            height: 54px;
            border-radius: 18px;
            background: #dcfce7;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
          }

          .count-title {
            margin: 16px 0 6px;
            color: #0f172a;
            font-size: 18px;
            font-weight: 900;
          }

          .count-number {
            margin: 0;
            color: #16a34a;
            font-size: 42px;
            line-height: 44px;
            font-weight: 900;
          }

          .count-text {
            margin: 4px 0 0;
            color: #64748b;
          }

          .main-grid {
            margin-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
          }

          .info-card,
          .update-card {
            background: white;
            border-radius: 28px;
            padding: 24px;
            box-shadow: 0 16px 38px rgba(15, 118, 110, 0.12);
            border: 1px solid rgba(22, 163, 74, 0.14);
          }

          .profile-row {
            display: flex;
            align-items: center;
            gap: 18px;
          }

          .avatar {
            width: 92px;
            height: 92px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid #dcfce7;
            background: #dcfce7;
          }

          .avatar-fallback {
            width: 92px;
            height: 92px;
            border-radius: 50%;
            background: #dcfce7;
            color: #16a34a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 38px;
            font-weight: 900;
          }

          .user-name {
            margin: 0 0 4px;
            color: #0f172a;
            font-size: 24px;
            font-weight: 900;
          }

          .user-email {
            margin: 0;
            color: #64748b;
            overflow-wrap: anywhere;
          }

          .badge-row {
            margin-top: 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .badge {
            display: inline-block;
            background: #dcfce7;
            color: #15803d;
            padding: 8px 14px;
            border-radius: 999px;
            font-weight: 900;
            text-transform: capitalize;
            font-size: 14px;
          }

          .info-list {
            margin-top: 18px;
            background: #f8fafc;
            border-radius: 20px;
            padding: 16px;
            color: #475569;
            line-height: 30px;
          }

          .info-list span {
            color: #0f172a;
            font-weight: 900;
          }

          .update-form {
            display: grid;
            gap: 13px;
          }

          .input-field {
            width: 100%;
            padding: 15px;
            border: 1px solid #d1d5db;
            border-radius: 16px;
            font-size: 15px;
            outline: none;
          }

          .input-field:focus {
            border-color: #16a34a;
            box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
          }

          .save-btn {
            background: #16a34a;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 16px;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
          }

          .save-btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .quick-menu {
            margin-top: 18px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          }

          .quick-btn {
            border: 1px solid #bbf7d0;
            background: #f0fdf4;
            color: #15803d;
            padding: 13px;
            border-radius: 15px;
            font-weight: 900;
            cursor: pointer;
            text-align: left;
            transition: 0.2s ease;
          }

          .quick-btn:hover {
            background: #16a34a;
            color: white;
            transform: translateY(-3px);
          }

          .logout-btn {
            margin-top: 14px;
            width: 100%;
            background: #ef4444;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 16px;
            font-weight: 900;
            cursor: pointer;
          }

          @media (max-width: 850px) {
            .main-grid {
              grid-template-columns: 1fr;
            }

            .summary-card {
              align-items: flex-start;
            }
          }

          @media (max-width: 520px) {
            .dashboard-page {
              padding: 14px;
            }

            .summary-title {
              font-size: 28px;
            }

            .profile-row {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="dashboard-container">
        <div className="summary-card">
          <div>
            <h1 className="summary-title">Dashboard</h1>
            <p className="summary-text">
              Welcome back, {user.name}. Here is your academic update summary.
            </p>
          </div>

          <div className="total-box">
            <p className="total-number">{totalUpdates}</p>
            <p className="total-label">Total Updates</p>
          </div>
        </div>

        <h2 className="section-title">Notifications</h2>

        <div className="count-grid">
          {countCards.map((card) => (
            <div
              className="count-card"
              key={card.title}
              onClick={() => navigate(card.path)}
            >
              <div className="count-icon">{card.icon}</div>
              <h3 className="count-title">{card.title}</h3>
              <p className="count-number">{card.count}</p>
              <p className="count-text">Total records</p>
            </div>
          ))}
        </div>

        <div className="main-grid">
          <div className="info-card">
            <h2 className="section-title">Account Information</h2>

            <div className="profile-row">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="avatar" />
              ) : (
                <div className="avatar-fallback">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              <div>
                <h3 className="user-name">{user.name}</h3>
                <p className="user-email">{user.email}</p>

                <div className="badge-row">
                  <span className="badge">{user.role}</span>
                  <span className="badge">Verified</span>
                </div>
              </div>
            </div>

            <div className="info-list">
              <div>
                <span>ID:</span> {user.userId || user.uid}
              </div>
              <div>
                <span>Name:</span> {user.name}
              </div>
              <div>
                <span>Email:</span> {user.email}
              </div>
              <div>
                <span>Role:</span> {user.role}
              </div>
            </div>

            
          </div>

          <div className="update-card">
            <h2 className="section-title">Update Profile</h2>

            <form className="update-form" onSubmit={handleUpdateProfile}>
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Update name"
                required
              />

             

              <button className="save-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

           
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;