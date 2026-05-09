import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase.config.js";

const FirebaseResourcePage = ({
  title,
  subtitle,
  icon,
  collectionName,
  fields,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const savedUser = localStorage.getItem("neub_current_user");
  const user = savedUser ? JSON.parse(savedUser) : null;
  const canManage = user?.role === "admin" || user?.role === "teacher";

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const data = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setItems(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const filteredItems = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    if (!text) return items;

    return items.filter((item) => {
      const searchableText = fields
        .map((field) => item[field.name])
        .concat([
          item.title,
          item.subject,
          item.day,
          item.name,
          item.studentId,
          item.description,
          item.note,
          item.status,
          item.teacher,
          item.time,
          item.date,
          item.deadline,
          item.uploadDate,
          item.room,
          item.amount,
          item.transactionId,
        ])
        .join(" ")
        .toLowerCase();

      return searchableText.includes(text);
    });
  }, [items, searchText, fields]);

  const getMainTitle = (item) => {
    return (
      item.title ||
      item.subject ||
      item.day ||
      item.studentId ||
      item.name ||
      "Untitled"
    );
  };

  const getMainDescription = (item) => {
    return (
      item.description ||
      item.note ||
      item.status ||
      item.teacher ||
      item.time ||
      "No description available."
    );
  };

  const getDateText = (item) => {
    return (
      item.date ||
      item.deadline ||
      item.uploadDate ||
      item.day ||
      "No date"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = {};

    fields.forEach((field) => {
      formData[field.name] = form[field.name].value;
    });

    try {
      if (editingItem) {
        await updateDoc(doc(db, collectionName, editingItem.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });

        alert(`${title} updated successfully.`);
      } else {
        await addDoc(collection(db, collectionName), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        alert(`${title} added successfully.`);
      }

      form.reset();
      setEditingItem(null);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save data.");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const agree = window.confirm("Are you sure you want to delete this item?");
    if (!agree) return;

    try {
      await deleteDoc(doc(db, collectionName, id));
      alert("Deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete data.");
    }
  };

  return (
    <div className="frp-page">
      <style>
        {`
          .frp-page * {
            box-sizing: border-box;
          }

          .frp-page {
            min-height: 100vh;
            padding: 24px;
            font-family: Arial, sans-serif;
            background:
              radial-gradient(circle at top left, rgba(187, 247, 208, 0.55), transparent 34%),
              radial-gradient(circle at bottom right, rgba(167, 243, 208, 0.65), transparent 35%),
              linear-gradient(135deg, #f8fafc, #ffffff, #ecfdf5);
          }

          .frp-container {
            max-width: 1100px;
            margin: 0 auto;
          }

          .frp-header {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 22px;
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
          }

          .frp-header-left {
            display: flex;
            align-items: center;
            gap: 16px;
            min-width: 0;
          }

          .frp-header-icon {
            width: 64px;
            height: 64px;
            min-width: 64px;
            border-radius: 20px;
            background: #0f172a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            line-height: 1;
          }

          .frp-title {
            margin: 0;
            color: #0f172a;
            font-size: 32px;
            line-height: 38px;
            font-weight: 900;
          }

          .frp-subtitle {
            margin: 6px 0 0;
            color: #64748b;
            font-size: 15px;
            line-height: 24px;
          }

          .frp-add-btn {
            border: none;
            background: #16a34a;
            color: white;
            padding: 13px 20px;
            border-radius: 15px;
            font-weight: 900;
            cursor: pointer;
            white-space: nowrap;
          }

          .frp-add-btn:hover {
            background: #15803d;
          }

          .frp-tools {
            margin-top: 16px;
            display: grid;
            grid-template-columns: 1fr 170px 170px;
            gap: 14px;
          }

          .frp-search-box,
          .frp-stat-box {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 22px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          }

          .frp-search-box {
            padding: 14px;
          }

          .frp-search-input {
            width: 100%;
            border: 1px solid #d1d5db;
            outline: none;
            background: #f8fafc;
            border-radius: 16px;
            padding: 15px;
            font-size: 15px;
            color: #0f172a;
          }

          .frp-search-input:focus {
            background: white;
            border-color: #16a34a;
            box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.13);
          }

          .frp-stat-box {
            padding: 16px;
            text-align: center;
          }

          .frp-stat-number {
            margin: 0;
            font-size: 34px;
            color: #16a34a;
            font-weight: 900;
            line-height: 38px;
          }

          .frp-stat-label {
            margin: 4px 0 0;
            color: #64748b;
            font-weight: 800;
            font-size: 13px;
          }

          .frp-form-card {
            margin-top: 16px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 22px;
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
          }

          .frp-form-title {
            margin: 0 0 16px;
            color: #0f172a;
            font-size: 22px;
            font-weight: 900;
          }

          .frp-form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 13px;
          }

          .frp-field label {
            display: block;
            margin-bottom: 7px;
            color: #334155;
            font-size: 13px;
            font-weight: 900;
          }

          .frp-input,
          .frp-textarea {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 16px;
            padding: 14px;
            outline: none;
            font-size: 15px;
            color: #0f172a;
          }

          .frp-textarea {
            min-height: 100px;
            resize: vertical;
          }

          .frp-input:focus,
          .frp-textarea:focus {
            border-color: #16a34a;
            box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.13);
          }

          .frp-form-actions {
            margin-top: 16px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .frp-save-btn,
          .frp-cancel-btn {
            border: none;
            padding: 13px 18px;
            border-radius: 15px;
            font-weight: 900;
            cursor: pointer;
          }

          .frp-save-btn {
            background: #16a34a;
            color: white;
          }

          .frp-cancel-btn {
            background: #f1f5f9;
            color: #334155;
          }

          .frp-section-title {
            margin: 24px 0 13px;
            color: #0f172a;
            font-size: 24px;
            font-weight: 900;
          }

          .frp-records {
            display: grid;
            gap: 13px;
          }

          .frp-record-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 18px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
            display: grid;
            grid-template-columns: 54px 1fr auto;
            gap: 14px;
            align-items: start;
            transition: 0.22s ease;
          }

          .frp-record-card:hover {
            transform: translateY(-4px);
            border-color: #86efac;
            box-shadow: 0 18px 38px rgba(15, 118, 110, 0.13);
          }

          .frp-record-icon {
            width: 54px;
            height: 54px;
            border-radius: 18px;
            background: #ecfdf5;
            color: #15803d;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 27px;
            line-height: 1;
          }

          .frp-record-title {
            margin: 0;
            color: #0f172a;
            font-size: 20px;
            font-weight: 900;
          }

          .frp-record-description {
            margin: 6px 0 0;
            color: #475569;
            line-height: 23px;
            font-size: 14px;
          }

          .frp-detail-grid {
            margin-top: 13px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
            gap: 8px;
          }

          .frp-detail {
            background: #f8fafc;
            border-radius: 14px;
            padding: 10px;
            border: 1px solid #e2e8f0;
          }

          .frp-detail-label {
            display: block;
            color: #94a3b8;
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .frp-detail-value {
            color: #334155;
            font-size: 13px;
            font-weight: 800;
            overflow-wrap: anywhere;
          }

          .frp-date-chip {
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #bbf7d0;
            padding: 9px 12px;
            border-radius: 999px;
            font-weight: 900;
            font-size: 13px;
            white-space: nowrap;
          }

          .frp-action-buttons {
            margin-top: 13px;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            flex-wrap: wrap;
          }

          .frp-edit-btn,
          .frp-delete-btn,
          .frp-file-btn {
            border: none;
            padding: 9px 12px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 900;
            cursor: pointer;
            text-decoration: none;
          }

          .frp-edit-btn {
            background: #dcfce7;
            color: #15803d;
          }

          .frp-delete-btn {
            background: #fee2e2;
            color: #dc2626;
          }

          .frp-file-btn {
            background: #dbeafe;
            color: #1d4ed8;
          }

          .frp-empty {
            background: white;
            border: 1px dashed #86efac;
            border-radius: 24px;
            padding: 42px 20px;
            text-align: center;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          }

          .frp-empty-icon {
            width: 78px;
            height: 78px;
            margin: 0 auto 14px;
            border-radius: 24px;
            background: #ecfdf5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 38px;
          }

          .frp-empty h3 {
            margin: 0 0 7px;
            color: #0f172a;
            font-size: 22px;
            font-weight: 900;
          }

          .frp-empty p {
            margin: 0;
            color: #64748b;
          }

          @media (max-width: 900px) {
            .frp-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .frp-header-left {
              align-items: flex-start;
            }

            .frp-tools {
              grid-template-columns: 1fr;
            }

            .frp-record-card {
              grid-template-columns: 1fr;
            }

            .frp-date-chip {
              display: inline-block;
            }

            .frp-action-buttons {
              justify-content: flex-start;
            }
          }

          @media (max-width: 520px) {
            .frp-page {
              padding: 14px;
            }

            .frp-header,
            .frp-form-card {
              border-radius: 20px;
            }

            .frp-title {
              font-size: 26px;
              line-height: 32px;
            }

            .frp-header-icon {
              width: 54px;
              height: 54px;
              min-width: 54px;
              font-size: 26px;
            }
          }
        `}
      </style>

      <div className="frp-container">
        <div className="frp-header">
          <div className="frp-header-left">
            <div className="frp-header-icon">{icon}</div>

            <div>
              <h1 className="frp-title">{title}</h1>
              <p className="frp-subtitle">{subtitle}</p>
            </div>
          </div>

          {canManage && (
            <button
              className="frp-add-btn"
              onClick={() => {
                setEditingItem(null);
                setShowForm(!showForm);
              }}
            >
              {showForm ? "Close" : "Add New"}
            </button>
          )}
        </div>

        <div className="frp-tools">
          <div className="frp-search-box">
            <input
              className="frp-search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          </div>

          <div className="frp-stat-box">
            <p className="frp-stat-number">{items.length}</p>
            <p className="frp-stat-label">Total Records</p>
          </div>

          <div className="frp-stat-box">
            <p className="frp-stat-number">{filteredItems.length}</p>
            <p className="frp-stat-label">Showing Now</p>
          </div>
        </div>

        {canManage && showForm && (
          <div className="frp-form-card">
            <h2 className="frp-form-title">
              {editingItem ? `Update ${title}` : `Add New ${title}`}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="frp-form-grid">
                {fields.map((field) => (
                  <div className="frp-field" key={field.name}>
                    <label>{field.placeholder}</label>

                    {field.name.toLowerCase().includes("description") ||
                    field.name.toLowerCase().includes("note") ? (
                      <textarea
                        className="frp-textarea"
                        name={field.name}
                        placeholder={field.placeholder}
                        defaultValue={editingItem?.[field.name] || ""}
                        required={field.required}
                      />
                    ) : (
                      <input
                        className="frp-input"
                        name={field.name}
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        defaultValue={editingItem?.[field.name] || ""}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="frp-form-actions">
                <button className="frp-save-btn" type="submit">
                  {editingItem ? "Update" : "Save"}
                </button>

                <button
                  className="frp-cancel-btn"
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <h2 className="frp-section-title">Records</h2>

        {loading && (
          <div className="frp-empty">
            <div className="frp-empty-icon">⏳</div>
            <h3>Loading data</h3>
            <p>Please wait while data is loading from Firebase.</p>
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="frp-empty">
            <div className="frp-empty-icon">{icon}</div>
            <h3>No records found</h3>
            <p>
              {canManage
                ? "Click Add New to create the first record."
                : "No data is available right now."}
            </p>
          </div>
        )}

        <div className="frp-records">
          {filteredItems.map((item) => (
            <div className="frp-record-card" key={item.id}>
              <div className="frp-record-icon">{icon}</div>

              <div>
                <h3 className="frp-record-title">{getMainTitle(item)}</h3>

                <p className="frp-record-description">
                  {getMainDescription(item)}
                </p>

                <div className="frp-detail-grid">
                  {fields.slice(0, 6).map((field) => (
                    <div className="frp-detail" key={field.name}>
                      <span className="frp-detail-label">
                        {field.placeholder}
                      </span>

                      <span className="frp-detail-value">
                        {item[field.name] || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="frp-date-chip">{getDateText(item)}</div>

                <div className="frp-action-buttons">
                  {item.fileUrl && (
                    <a
                      className="frp-file-btn"
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      File
                    </a>
                  )}

                  {canManage && (
                    <>
                      <button
                        className="frp-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="frp-delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FirebaseResourcePage;