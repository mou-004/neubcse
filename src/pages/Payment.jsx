import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase.config.js";

const Payment = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paidRecords, setPaidRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState("");
  const [activeTab, setActiveTab] = useState("notices");
  const [paidSearch, setPaidSearch] = useState("");

  const [title, setTitle] = useState("Society Fee");
  const [amount, setAmount] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [emailInputs, setEmailInputs] = useState({});

  useEffect(() => {
    const completePaymentFromEmailLink = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) return;

      try {
        let email = localStorage.getItem("pendingPaymentEmail");

        if (!email) {
          email = window.prompt("Enter your email to complete payment verification");
        }

        if (!email) return;

        const result = await signInWithEmailLink(auth, email, window.location.href);

        const pendingRaw = localStorage.getItem("pendingPaymentData");

        if (!pendingRaw) {
          alert("Payment data not found. Please try again.");
          window.history.replaceState({}, document.title, "/payment");
          return;
        }

        const pendingPayment = JSON.parse(pendingRaw);

        const userDocRef = doc(db, "users", result.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : {};

        await setDoc(
          doc(db, "paymentSubmissions", `${pendingPayment.paymentId}_${result.user.uid}`),
          {
            paymentId: pendingPayment.paymentId,
            paymentTitle: pendingPayment.paymentTitle,
            amount: pendingPayment.amount,
            lastDate: pendingPayment.lastDate,
            studentUid: result.user.uid,
            studentName: userData.name || result.user.displayName || "Student",
            studentEmail: result.user.email,
            status: "paid",
            paidAt: serverTimestamp(),
          }
        );

        localStorage.removeItem("pendingPaymentEmail");
        localStorage.removeItem("pendingPaymentData");

        window.history.replaceState({}, document.title, "/payment");

        alert("Payment verified successfully. Status: Paid.");
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };

    completePaymentFromEmailLink();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      const savedUserRaw = localStorage.getItem("neub_current_user");
      const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};

      const currentUser = {
        uid: firebaseUser.uid,
        name: userData.name || savedUser?.name || firebaseUser.displayName || "User",
        email: firebaseUser.email,
        role: userData.role || savedUser?.role || "student",
      };

      localStorage.setItem("neub_current_user", JSON.stringify(currentUser));
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const unsubscribePayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      data.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setPayments(data);
    });

    const unsubscribePaid = onSnapshot(collection(db, "paymentSubmissions"), (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      data.sort((a, b) => {
        const aTime = a.paidAt?.seconds || 0;
        const bTime = b.paidAt?.seconds || 0;
        return bTime - aTime;
      });

      setPaidRecords(data);
    });

    return () => {
      unsubscribePayments();
      unsubscribePaid();
    };
  }, []);

  const canManage = user?.role === "admin" || user?.role === "teacher";
  const isStudent = user?.role === "student";

  const myPaidCount = paidRecords.filter(
    (record) => record.studentUid === user?.uid && record.status === "paid"
  ).length;

  const totalCollectionAmount = payments.reduce((sum, payment) => {
    const paidCount = paidRecords.filter(
      (record) => record.paymentId === payment.id && record.status === "paid"
    ).length;

    return sum + Number(payment.amount || 0) * paidCount;
  }, 0);

  const filteredPaidRecords = useMemo(() => {
    const text = paidSearch.toLowerCase().trim();

    if (!text) return paidRecords;

    return paidRecords.filter((record) => {
      const searchable = [
        record.studentName,
        record.studentEmail,
        record.paymentTitle,
        record.amount,
        record.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(text);
    });
  }, [paidRecords, paidSearch]);

  const getPaidCount = (paymentId) => {
    return paidRecords.filter(
      (record) => record.paymentId === paymentId && record.status === "paid"
    ).length;
  };

  const isPaid = (paymentId) => {
    return paidRecords.some(
      (record) =>
        record.paymentId === paymentId &&
        record.studentUid === user?.uid &&
        record.status === "paid"
    );
  };

  const formatPaidDate = (paidAt) => {
    if (!paidAt?.seconds) return "N/A";
    return new Date(paidAt.seconds * 1000).toLocaleString();
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();

    if (!title || !amount || !lastDate) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "payments"), {
        title,
        amount,
        lastDate,
        createdBy: user.name,
        createdByRole: user.role,
        createdAt: serverTimestamp(),
      });

      setTitle("Society Fee");
      setAmount("");
      setLastDate("");
      setActiveTab("notices");

      alert("Payment notice created successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const agree = window.confirm("Delete this payment notice?");
    if (!agree) return;

    try {
      await deleteDoc(doc(db, "payments", paymentId));
      alert("Payment notice deleted.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleEmailChange = (paymentId, value) => {
    setEmailInputs((prev) => ({
      ...prev,
      [paymentId]: value,
    }));
  };

  const handleSendPaymentLink = async (payment) => {
    const typedEmail = emailInputs[payment.id]?.trim().toLowerCase();

    if (!typedEmail) {
      alert("Please enter your registered email first.");
      return;
    }

    if (typedEmail !== user.email.toLowerCase()) {
      alert("This email does not match your registered email.");
      return;
    }

    if (isPaid(payment.id)) {
      alert("This payment is already paid.");
      return;
    }

    try {
      setSendingId(payment.id);

      const actionCodeSettings = {
        url: `${window.location.origin}/payment`,
        handleCodeInApp: true,
      };

      localStorage.setItem("pendingPaymentEmail", typedEmail);
      localStorage.setItem(
        "pendingPaymentData",
        JSON.stringify({
          paymentId: payment.id,
          paymentTitle: payment.title,
          amount: payment.amount,
          lastDate: payment.lastDate,
        })
      );

      await sendSignInLinkToEmail(auth, typedEmail, actionCodeSettings);

      alert("Payment verification link sent. Check inbox or spam.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSendingId("");
    }
  };

  if (loading) {
    return (
      <div className="pay-page">
        <style>{styles}</style>
        <div className="pay-empty-card">Loading payment page...</div>
      </div>
    );
  }

  return (
    <div className="pay-page">
      <style>{styles}</style>

      <div className="pay-container">
        <div className="pay-top-card">
          <div className="pay-top-icon">💳</div>

          <div>
            <h1>Payment</h1>
            <p>Payment notices, email verification, and paid student records.</p>
          </div>

          
        </div>

        <div className="pay-stats-grid">
          <div className="pay-stat-card">
            <span>Payment Notices</span>
            <h2>{payments.length}</h2>
          </div>

          <div className="pay-stat-card">
            <span>Total Paid Records</span>
            <h2>{paidRecords.length}</h2>
          </div>

          <div className="pay-stat-card">
            <span>{isStudent ? "My Paid Records" : "Collected Amount"}</span>
            <h2>{isStudent ? myPaidCount : `৳ ${totalCollectionAmount}`}</h2>
          </div>
        </div>

        {canManage && (
          <div className="pay-tabs">
            <button
              className={activeTab === "notices" ? "active" : ""}
              onClick={() => setActiveTab("notices")}
            >
              Payment Notices
            </button>

            <button
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
            >
              Create Notice
            </button>

            <button
              className={activeTab === "paid" ? "active" : ""}
              onClick={() => setActiveTab("paid")}
            >
              Paid Students
            </button>
          </div>
        )}

        {canManage && activeTab === "create" && (
          <div className="pay-create-card">
            <div className="pay-section-head">
              <h2>Create Payment Notice</h2>
              <p>Set payment title, amount, and last date for students.</p>
            </div>

            <form className="pay-form" onSubmit={handleCreatePayment}>
              <div className="pay-field">
                <label>Payment Title</label>
                <select value={title} onChange={(e) => setTitle(e.target.value)} required>
                  <option value="Society Fee">Society Fee</option>
                  <option value="Department Fee">Department Fee</option>
                </select>
              </div>

              <div className="pay-field">
                <label>Amount</label>
                <input
                  type="number"
                  placeholder="Example: 200"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="pay-field">
                <label>Last Date</label>
                <input
                  type="date"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit">Create Payment</button>
            </form>
          </div>
        )}

        {(!canManage || activeTab === "notices") && (
          <>
            <div className="pay-section-head">
              <h2>Payment Notices</h2>
              <p>Students can verify payment from their registered email.</p>
            </div>

            {payments.length === 0 ? (
              <div className="pay-empty-card">No payment notice found.</div>
            ) : (
              <div className="pay-card-grid">
                {payments.map((payment) => {
                  const paid = isPaid(payment.id);
                  const paidCount = getPaidCount(payment.id);

                  return (
                    <div className="pay-notice-card" key={payment.id}>
                      <div className="pay-card-top">
                        <div className="pay-card-icon">💳</div>
                        <span className="pay-date-chip">Due: {payment.lastDate}</span>
                      </div>

                      <h3>{payment.title}</h3>
                      <div className="pay-amount">৳ {payment.amount}</div>

                      <div className="pay-info-list">
                        <div>
                          <span>Created by</span>
                          <strong>{payment.createdBy || "Teacher/Admin"}</strong>
                        </div>

                        {canManage && (
                          <div>
                            <span>Paid students</span>
                            <strong>{paidCount}</strong>
                          </div>
                        )}
                      </div>

                      {isStudent && (
                        <div className="pay-student-box">
                          {paid ? (
                            <div className="pay-paid-badge">Paid</div>
                          ) : (
                            <>
                              <input
                                type="email"
                                placeholder="Enter registered email"
                                value={emailInputs[payment.id] || ""}
                                onChange={(e) =>
                                  handleEmailChange(payment.id, e.target.value)
                                }
                              />

                              <button
                                type="button"
                                disabled={sendingId === payment.id}
                                onClick={() => handleSendPaymentLink(payment)}
                              >
                                {sendingId === payment.id
                                  ? "Sending Link..."
                                  : "Send Verification Link"}
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {canManage && (
                        <button
                          type="button"
                          className="pay-delete-btn"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          Delete Notice
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {canManage && activeTab === "paid" && (
          <>
            <div className="pay-section-row">
              <div className="pay-section-head">
                <h2>Paid Student List</h2>
                <p>View which students have completed payment verification.</p>
              </div>

              <input
                className="pay-search"
                value={paidSearch}
                onChange={(e) => setPaidSearch(e.target.value)}
                placeholder="Search student, email, payment..."
              />
            </div>

            {filteredPaidRecords.length === 0 ? (
              <div className="pay-empty-card">No paid student found.</div>
            ) : (
              <div className="pay-table-card">
                <div className="pay-table">
                  <div className="pay-row pay-head">
                    <div>Student</div>
                    <div>Email</div>
                    <div>Payment</div>
                    <div>Amount</div>
                    <div>Paid Date</div>
                  </div>

                  {filteredPaidRecords.map((record) => (
                    <div className="pay-row" key={record.id}>
                      <div>{record.studentName || "Student"}</div>
                      <div>{record.studentEmail || "N/A"}</div>
                      <div>{record.paymentTitle || "N/A"}</div>
                      <div>৳ {record.amount || "0"}</div>
                      <div>{formatPaidDate(record.paidAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

  .pay-page {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(187, 247, 208, 0.6), transparent 34%),
      radial-gradient(circle at bottom right, rgba(167, 243, 208, 0.7), transparent 35%),
      linear-gradient(135deg, #f8fafc, #ffffff, #ecfdf5);
  }

  .pay-container {
    max-width: 1120px;
    margin: 0 auto;
  }

  .pay-top-card {
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

  .pay-top-icon {
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

  .pay-top-card h1 {
    margin: 0;
    color: #0f172a;
    font-size: 36px;
    font-weight: 900;
  }

  .pay-top-card p {
    margin: 7px 0 0;
    color: #64748b;
    line-height: 24px;
  }

  .pay-add-top-btn {
    border: none;
    background: #16a34a;
    color: white;
    padding: 14px 22px;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
  }

  .pay-stats-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .pay-stat-card,
  .pay-create-card,
  .pay-notice-card,
  .pay-table-card,
  .pay-empty-card {
    background: white;
    border: 1px solid #e2e8f0;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  }

  .pay-stat-card {
    border-radius: 22px;
    padding: 20px;
    text-align: center;
  }

  .pay-stat-card span {
    color: #64748b;
    font-weight: 800;
    font-size: 14px;
  }

  .pay-stat-card h2 {
    margin: 10px 0 0;
    color: #16a34a;
    font-size: 34px;
    font-weight: 900;
  }

  .pay-tabs {
    margin-top: 18px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 22px;
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  }

  .pay-tabs button {
    border: none;
    border-radius: 16px;
    padding: 13px;
    background: transparent;
    color: #64748b;
    font-weight: 900;
    cursor: pointer;
  }

  .pay-tabs button.active {
    background: #16a34a;
    color: white;
  }

  .pay-section-head {
    margin-top: 24px;
  }

  .pay-section-head h2 {
    margin: 0;
    color: #0f172a;
    font-size: 28px;
    font-weight: 900;
  }

  .pay-section-head p {
    margin: 8px 0 0;
    color: #64748b;
  }

  .pay-create-card {
    margin-top: 18px;
    border-radius: 26px;
    padding: 24px;
  }

  .pay-create-card .pay-section-head {
    margin-top: 0;
    margin-bottom: 18px;
  }

  .pay-form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 12px;
    align-items: end;
  }

  .pay-field label {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 13px;
    font-weight: 900;
  }

  .pay-field input,
  .pay-field select,
  .pay-search,
  .pay-student-box input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 16px;
    padding: 14px;
    font-size: 15px;
    outline: none;
    background: #f8fafc;
  }

  .pay-field input:focus,
  .pay-field select:focus,
  .pay-search:focus,
  .pay-student-box input:focus {
    background: white;
    border-color: #16a34a;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.13);
  }

  .pay-form button {
    border: none;
    background: #16a34a;
    color: white;
    padding: 15px 20px;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
  }

  .pay-card-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .pay-notice-card {
    border-radius: 26px;
    padding: 20px;
    transition: 0.24s ease;
  }

  .pay-notice-card:hover {
    transform: translateY(-5px);
    border-color: #86efac;
    box-shadow: 0 22px 45px rgba(15, 118, 110, 0.14);
  }

  .pay-card-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .pay-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: #ecfdf5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .pay-date-chip {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #15803d;
    padding: 9px 12px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 13px;
  }

  .pay-notice-card h3 {
    margin: 18px 0 8px;
    color: #0f172a;
    font-size: 24px;
    font-weight: 900;
  }

  .pay-amount {
    color: #16a34a;
    font-size: 38px;
    font-weight: 900;
    margin-bottom: 14px;
  }

  .pay-info-list {
    display: grid;
    gap: 10px;
  }

  .pay-info-list div {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 12px;
    border-radius: 16px;
  }

  .pay-info-list span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .pay-info-list strong {
    color: #334155;
    overflow-wrap: anywhere;
  }

  .pay-student-box {
    margin-top: 14px;
  }

  .pay-student-box input {
    margin-bottom: 10px;
  }

  .pay-student-box button,
  .pay-delete-btn,
  .pay-paid-badge {
    width: 100%;
    border: none;
    padding: 13px;
    border-radius: 15px;
    font-weight: 900;
  }

  .pay-student-box button {
    background: #16a34a;
    color: white;
    cursor: pointer;
  }

  .pay-student-box button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .pay-paid-badge {
    background: #dcfce7;
    color: #15803d;
    text-align: center;
  }

  .pay-delete-btn {
    margin-top: 14px;
    background: #fee2e2;
    color: #dc2626;
    cursor: pointer;
  }

  .pay-section-row {
    margin-top: 6px;
    display: grid;
    grid-template-columns: 1fr 320px;
    align-items: end;
    gap: 16px;
  }

  .pay-table-card {
    margin-top: 16px;
    border-radius: 26px;
    padding: 16px;
    overflow-x: auto;
  }

  .pay-table {
    min-width: 900px;
  }

  .pay-row {
    display: grid;
    grid-template-columns: 1.2fr 1.7fr 1fr 0.7fr 1.3fr;
    gap: 12px;
    padding: 14px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    align-items: center;
  }

  .pay-row:last-child {
    border-bottom: none;
  }

  .pay-head {
    background: #f0fdf4;
    color: #15803d;
    border-radius: 16px;
    border-bottom: none;
    font-weight: 900;
  }

  .pay-empty-card {
    margin-top: 16px;
    border-radius: 24px;
    padding: 28px;
    text-align: center;
    color: #64748b;
  }

  @media (max-width: 900px) {
    .pay-top-card {
      grid-template-columns: 72px 1fr;
    }

    .pay-add-top-btn {
      grid-column: 1 / -1;
      width: 100%;
    }

    .pay-stats-grid,
    .pay-form,
    .pay-section-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .pay-page {
      padding: 14px;
    }

    .pay-top-card {
      grid-template-columns: 1fr;
      text-align: center;
      justify-items: center;
      border-radius: 24px;
    }

    .pay-top-card h1 {
      font-size: 32px;
    }

    .pay-tabs {
      grid-template-columns: 1fr;
    }
  }
`;

export default Payment;