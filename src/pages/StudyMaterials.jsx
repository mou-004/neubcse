import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase.config.js";

const StudyMaterials = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [searchText, setSearchText] = useState("");

  const [editingMaterial, setEditingMaterial] = useState(null);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [category, setCategory] = useState("Lecture Note");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          navigate("/login");
          return;
        }

        const savedUserRaw = localStorage.getItem("neub_current_user");
        const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

        let userData = {};

        try {
          const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
          userData = userSnap.exists() ? userSnap.data() : {};
        } catch (error) {
          console.error("User read error:", error);
        }

        const currentUser = {
          uid: firebaseUser.uid,
          name:
            userData.name ||
            savedUser?.name ||
            firebaseUser.displayName ||
            "User",
          email: firebaseUser.email,
          role: userData.role || savedUser?.role || "student",
        };

        setUser(currentUser);
        localStorage.setItem("neub_current_user", JSON.stringify(currentUser));
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "studyMaterials"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setMaterials(data);
      },
      (error) => {
        console.error("Materials load error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const canManage = user?.role === "teacher" || user?.role === "admin";

  const filteredMaterials = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    if (!text) return materials;

    return materials.filter((item) => {
      const searchable = [
        item.title,
        item.course,
        item.category,
        item.description,
        item.createdByName,
        item.createdBy,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(text);
    });
  }, [materials, searchText]);

  const resetForm = () => {
    setEditingMaterial(null);
    setTitle("");
    setCourse("");
    setCategory("Lecture Note");
    setDescription("");
    setFileUrl("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title || !course || !category || !description || !fileUrl) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setSaving(true);

      if (editingMaterial) {
        await updateDoc(doc(db, "studyMaterials", editingMaterial.id), {
          title,
          course,
          category,
          description,
          fileUrl,
          updatedAt: serverTimestamp(),
        });

        alert("Study material updated.");
      } else {
        await addDoc(collection(db, "studyMaterials"), {
          title,
          course,
          category,
          description,
          fileUrl,
          createdByName: user.name || "Teacher",
          createdBy: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        alert("Study material added.");
      }

      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setTitle(material.title || "");
    setCourse(material.course || "");
    setCategory(material.category || "Lecture Note");
    setDescription(material.description || "");
    setFileUrl(material.fileUrl || "");
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const agree = window.confirm("Delete this material?");
    if (!agree) return;

    try {
      await deleteDoc(doc(db, "studyMaterials", id));
      alert("Material deleted.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const openLink = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="page">
        <style>{styles}</style>
        <div className="empty-card">Loading study materials...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{styles}</style>

      <div className="container">
        <div className="top-card">
          <div className="top-icon">📚</div>

          <div>
            <h1>Study Materials</h1>
            <p>Real-time class notes, PDFs, slides, books, and academic resources.</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Materials</span>
            <h2>{materials.length}</h2>
          </div>

          <div className="stat-card">
            <span>Showing Now</span>
            <h2>{filteredMaterials.length}</h2>
          </div>

          <div className="stat-card">
            <span>Access</span>
            <h2>{canManage ? "Manage" : "Download"}</h2>
          </div>
        </div>

        {canManage && (
          <div className="tabs">
            <button
              className={activeTab === "list" ? "active" : ""}
              onClick={() => setActiveTab("list")}
            >
              Material List
            </button>

            <button
              className={activeTab === "create" ? "active" : ""}
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
            >
              {editingMaterial ? "Update Material" : "Add Material"}
            </button>
          </div>
        )}

        {canManage && activeTab === "create" && (
          <div className="form-card">
            <div className="section-head">
              <h2>{editingMaterial ? "Update Material" : "Add Study Material"}</h2>
              <p>Paste a Google Drive, PDF, or file link. No Firebase Storage needed.</p>
            </div>

            <form className="form-grid" onSubmit={handleSave}>
              <div className="field">
                <label>Material Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Lecture 07"
                  required
                />
              </div>

              <div className="field">
                <label>Course / Subject</label>
                <input
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Example: CSE 2201"
                  required
                />
              </div>

              <div className="field">
                <label>Material Type</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Lecture Note">Lecture Note</option>
                  <option value="PDF">PDF</option>
                  <option value="Slide">Slide</option>
                  <option value="Book">Book</option>
                  <option value="Question">Question</option>
                  <option value="Lab Manual">Lab Manual</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field full">
                <label>File Link</label>
                <input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="Paste Google Drive / PDF / file link"
                  required
                />
              </div>

              <div className="field full">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write short details about this material..."
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingMaterial
                    ? "Update Material"
                    : "Add Material"}
                </button>

                {editingMaterial && (
                  <button type="button" className="cancel-btn" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {(!canManage || activeTab === "list") && (
          <>
            <div className="section-row">
              <div className="section-head">
                <h2>Material List</h2>
                <p>Search, open, and download available study materials.</p>
              </div>

              <input
                className="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search materials..."
              />
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="empty-card">No study material found.</div>
            ) : (
              <div className="card-grid">
                {filteredMaterials.map((material) => (
                  <div className="item-card" key={material.id}>
                    <div className="card-top">
                      <div className="card-icon">📘</div>
                      <span className="chip">{material.category}</span>
                    </div>

                    <h3>{material.title}</h3>
                    <div className="amount-text">{material.course}</div>

                    <p>{material.description}</p>

                    <div className="info-list">
                      <div>
                        <span>Uploaded by</span>
                        <strong>{material.createdByName || "Teacher"}</strong>
                      </div>

                      <div>
                        <span>Uploaded at</span>
                        <strong>{formatDate(material.createdAt)}</strong>
                      </div>
                    </div>

                    <button
                      className="dark-btn"
                      type="button"
                      onClick={() => openLink(material.fileUrl)}
                    >
                      Open / Download Material
                    </button>

                    {canManage && (
                      <div className="action-row">
                        <button type="button" onClick={() => handleEdit(material)}>
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDelete(material.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = `
  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: Arial, sans-serif;
  }

  .page {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(187, 247, 208, 0.6), transparent 34%),
      radial-gradient(circle at bottom right, rgba(167, 243, 208, 0.7), transparent 35%),
      linear-gradient(135deg, #f8fafc, #ffffff, #ecfdf5);
  }

  .container {
    max-width: 1120px;
    margin: 0 auto;
  }

  .top-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 28px;
    padding: 24px;
    display: grid;
    grid-template-columns: 78px 1fr;
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

  .stats-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .stat-card,
  .form-card,
  .item-card,
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

  .form-card {
    margin-top: 18px;
    border-radius: 26px;
    padding: 24px;
  }

  .section-head {
    margin-top: 24px;
  }

  .form-card .section-head {
    margin-top: 0;
    margin-bottom: 18px;
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

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 13px;
  }

  .field label {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 13px;
    font-weight: 900;
  }

  .field input,
  .field select,
  .field textarea,
  .search {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 16px;
    padding: 14px;
    font-size: 15px;
    outline: none;
    background: #f8fafc;
  }

  .field textarea {
    min-height: 110px;
    resize: vertical;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus,
  .search:focus {
    background: white;
    border-color: #16a34a;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.13);
  }

  .full {
    grid-column: 1 / -1;
  }

  .form-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .form-actions button,
  .action-row button {
    border: none;
    background: #16a34a;
    color: white;
    padding: 12px 16px;
    border-radius: 14px;
    font-weight: 900;
    cursor: pointer;
  }

  .form-actions button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: #e2e8f0 !important;
    color: #334155 !important;
  }

  .section-row {
    margin-top: 6px;
    display: grid;
    grid-template-columns: 1fr 320px;
    align-items: end;
    gap: 16px;
  }

  .card-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .item-card {
    border-radius: 26px;
    padding: 20px;
    transition: 0.24s ease;
  }

  .item-card:hover {
    transform: translateY(-5px);
    border-color: #86efac;
    box-shadow: 0 22px 45px rgba(15, 118, 110, 0.14);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: #ecfdf5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .chip {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #15803d;
    padding: 9px 12px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 13px;
  }

  .item-card h3 {
    margin: 18px 0 8px;
    color: #0f172a;
    font-size: 24px;
    font-weight: 900;
  }

  .amount-text {
    color: #16a34a;
    font-size: 26px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .item-card p {
    color: #475569;
    line-height: 24px;
  }

  .info-list {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }

  .info-list div {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 12px;
    border-radius: 16px;
  }

  .info-list span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .info-list strong {
    color: #334155;
    overflow-wrap: anywhere;
  }

  .dark-btn {
    margin-top: 14px;
    width: 100%;
    border: none;
    background: #0f172a;
    color: white;
    text-align: center;
    padding: 13px;
    border-radius: 15px;
    font-weight: 900;
    cursor: pointer;
  }

  .action-row {
    margin-top: 14px;
    display: flex;
    gap: 8px;
  }

  .delete-btn {
    background: #fee2e2 !important;
    color: #dc2626 !important;
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

    .stats-grid,
    .form-grid,
    .section-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .page {
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

    .action-row {
      flex-direction: column;
    }
  }
`;

export default StudyMaterials;