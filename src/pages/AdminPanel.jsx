import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase.config.js";

const AdminPanel = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paidRecords, setPaidRecords] = useState([]);

  const [activeTab, setActiveTab] = useState("users");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          navigate("/login");
          return;
        }

        const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));

        if (!userSnap.exists()) {
          await signOut(auth);
          localStorage.clear();
          navigate("/login");
          return;
        }

        const userData = userSnap.data();

        if (userData.role !== "admin") {
          alert("Only admin can access admin panel.");
          navigate("/dashboard");
          return;
        }

        const loggedAdmin = {
          uid: firebaseUser.uid,
          name: userData.name || "Admin",
          email: firebaseUser.email,
          role: userData.role,
        };

        setAdmin(loggedAdmin);
        localStorage.setItem("neub_current_user", JSON.stringify(loggedAdmin));
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
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setUsers(data);
    });

    const unsubNotices = onSnapshot(collection(db, "notices"), (snapshot) => {
      setNotices(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubAssignments = onSnapshot(collection(db, "assignments"), (snapshot) => {
      setAssignments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubMaterials = onSnapshot(collection(db, "studyMaterials"), (snapshot) => {
      setMaterials(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubPayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      setPayments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubPaid = onSnapshot(collection(db, "paymentSubmissions"), (snapshot) => {
      setPaidRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    return () => {
      unsubUsers();
      unsubNotices();
      unsubAssignments();
      unsubMaterials();
      unsubPayments();
      unsubPaid();
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    if (!text) return users;

    return users.filter((user) => {
      const searchable = [
        user.name,
        user.email,
        user.role,
        user.userId,
        user.department,
        user.batch,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(text);
    });
  }, [users, searchText]);

  const students = users.filter((user) => user.role === "student");
  const teachers = users.filter((user) => user.role === "teacher");
  const admins = users.filter((user) => user.role === "admin");

  const totalCollected = payments.reduce((sum, payment) => {
    const count = paidRecords.filter(
      (record) => record.paymentId === payment.id && record.status === "paid"
    ).length;

    return sum + Number(payment.amount || 0) * count;
  }, 0);

  const handleRoleChange = async (userId, newRole) => {
    const agree = window.confirm(`Change this user role to ${newRole}?`);
    if (!agree) return;

    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
      });

      alert("User role updated.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const agree = window.confirm("Delete this user profile from Firestore?");
    if (!agree) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      alert("User profile deleted from Firestore.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/");
  };

  if (checking) {
    return (
      <div className="admin-page">
        <style>{styles}</style>
        <div className="empty-card">Checking admin access...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <div className="admin-container">
        <div className="top-card">
          <div className="top-icon">🛡️</div>

          <div>
            <h1>Admin Panel</h1>
            <p>Manage users, roles, academic records, and payment overview.</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Users</span>
            <h2>{users.length}</h2>
          </div>

          <div className="stat-card">
            <span>Students</span>
            <h2>{students.length}</h2>
          </div>

          <div className="stat-card">
            <span>Teachers</span>
            <h2>{teachers.length}</h2>
          </div>

          <div className="stat-card">
            <span>Admins</span>
            <h2>{admins.length}</h2>
          </div>

          <div className="stat-card">
            <span>Assignments</span>
            <h2>{assignments.length}</h2>
          </div>

          <div className="stat-card">
            <span>Materials</span>
            <h2>{materials.length}</h2>
          </div>

          <div className="stat-card">
            <span>Notices</span>
            <h2>{notices.length}</h2>
          </div>

          <div className="stat-card">
            <span>Payments</span>
            <h2>{payments.length}</h2>
          </div>

          <div className="stat-card">
            <span>Collected</span>
            <h2>৳ {totalCollected}</h2>
          </div>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>

          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
        </div>

        {activeTab === "users" && (
          <>
            <div className="section-row">
              <div className="section-head">
                <h2>User Management</h2>
                <p>Search users and change student, teacher, or admin role.</p>
              </div>

              <input
                className="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search name, email, role..."
              />
            </div>

            <div className="table-card">
              <div className="table">
                <div className="row head">
                  <div>Name</div>
                  <div>Email</div>
                  <div>ID</div>
                  <div>Role</div>
                  <div>Change Role</div>
                  <div>Action</div>
                </div>

                {filteredUsers.map((user) => (
                  <div className="row" key={user.id}>
                    <div>{user.name || "User"}</div>
                    <div>{user.email || "N/A"}</div>
                    <div>{user.userId || "N/A"}</div>
                    <div>
                      <span className={`role ${user.role || "student"}`}>
                        {user.role || "student"}
                      </span>
                    </div>

                    <div>
                      <select
                        value={user.role || "student"}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>

                    <div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "overview" && (
          <>
            <div className="section-head">
              <h2>System Overview</h2>
              <p>Quick access summary of all important app modules.</p>
            </div>

            <div className="module-grid">
              <button onClick={() => navigate("/notices")}>Notices</button>
              <button onClick={() => navigate("/assignments")}>Assignments</button>
              <button onClick={() => navigate("/study-materials")}>Study Materials</button>
              <button onClick={() => navigate("/class-routine")}>Class Routine</button>
              <button onClick={() => navigate("/payment")}>Payment</button>
              <button onClick={() => navigate("/dashboard")}>Dashboard</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: Arial, sans-serif;
  }

  .admin-page {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(187, 247, 208, 0.6), transparent 34%),
      radial-gradient(circle at bottom right, rgba(167, 243, 208, 0.7), transparent 35%),
      linear-gradient(135deg, #f8fafc, #ffffff, #ecfdf5);
  }

  .admin-container {
    max-width: 1180px;
    margin: 0 auto;
  }

  .top-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 28px;
    padding: 24px;
    display: grid;
    grid-template-columns: 78px 1fr auto;
    align-items: center;
    gap: 18px;
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  }

  .top-icon {
    width: 72px;
    height: 72px;
    border-radius: 24px;
    background: #0f172a;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
  }

  .top-card h1 {
    margin: 0;
    color: #0f172a;
    font-size: 36px;
    font-weight: 900;
  }

  .top-card p {
    margin: 7px 0 0;
    color: #64748b;
    line-height: 24px;
  }

  .logout-btn {
    border: none;
    background: #ef4444;
    color: white;
    padding: 14px 22px;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
  }

  .stats-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .stat-card,
  .table-card,
  .empty-card {
    background: white;
    border: 1px solid #e2e8f0;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  }

  .stat-card {
    border-radius: 22px;
    padding: 20px;
    text-align: center;
  }

  .stat-card span {
    color: #64748b;
    font-weight: 800;
    font-size: 14px;
  }

  .stat-card h2 {
    margin: 10px 0 0;
    color: #16a34a;
    font-size: 34px;
    font-weight: 900;
  }

  .tabs {
    margin-top: 18px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 22px;
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  }

  .tabs button {
    border: none;
    border-radius: 16px;
    padding: 13px;
    background: transparent;
    color: #64748b;
    font-weight: 900;
    cursor: pointer;
  }

  .tabs button.active {
    background: #16a34a;
    color: white;
  }

  .section-row {
    margin-top: 6px;
    display: grid;
    grid-template-columns: 1fr 320px;
    align-items: end;
    gap: 16px;
  }

  .section-head {
    margin-top: 24px;
  }

  .section-head h2 {
    margin: 0;
    color: #0f172a;
    font-size: 28px;
    font-weight: 900;
  }

  .section-head p {
    margin: 8px 0 0;
    color: #64748b;
  }

  .search,
  select {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 16px;
    padding: 14px;
    font-size: 15px;
    outline: none;
    background: #f8fafc;
  }

  .search:focus,
  select:focus {
    background: white;
    border-color: #16a34a;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.13);
  }

  .table-card {
    margin-top: 16px;
    border-radius: 26px;
    padding: 16px;
    overflow-x: auto;
  }

  .table {
    min-width: 980px;
  }

  .row {
    display: grid;
    grid-template-columns: 1.1fr 1.8fr 0.8fr 0.8fr 1fr 0.7fr;
    gap: 12px;
    padding: 14px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    align-items: center;
  }

  .row:last-child {
    border-bottom: none;
  }

  .head {
    background: #f0fdf4;
    color: #15803d;
    border-radius: 16px;
    border-bottom: none;
    font-weight: 900;
  }

  .role {
    display: inline-block;
    padding: 8px 12px;
    border-radius: 999px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .role.student {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .role.teacher {
    background: #dcfce7;
    color: #15803d;
  }

  .role.admin {
    background: #fee2e2;
    color: #dc2626;
  }

  .delete-btn {
    border: none;
    background: #fee2e2;
    color: #dc2626;
    padding: 10px 14px;
    border-radius: 14px;
    font-weight: 900;
    cursor: pointer;
  }

  .module-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }

  .module-grid button {
    border: 1px solid #e2e8f0;
    background: white;
    color: #0f172a;
    padding: 24px;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
    transition: 0.24s ease;
  }

  .module-grid button:hover {
    transform: translateY(-5px);
    border-color: #86efac;
    color: #16a34a;
  }

  .empty-card {
    margin-top: 16px;
    border-radius: 24px;
    padding: 28px;
    text-align: center;
    color: #64748b;
  }

  @media (max-width: 900px) {
    .top-card {
      grid-template-columns: 72px 1fr;
    }

    .logout-btn {
      grid-column: 1 / -1;
      width: 100%;
    }

    .stats-grid,
    .section-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .admin-page {
      padding: 14px;
    }

    .top-card {
      grid-template-columns: 1fr;
      text-align: center;
      justify-items: center;
      border-radius: 24px;
    }

    .top-card h1 {
      font-size: 32px;
    }

    .tabs {
      grid-template-columns: 1fr;
    }
  }
`;

export default AdminPanel;