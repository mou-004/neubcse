import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase.config.js";

const Assignments = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingId, setSubmittingId] = useState("");

  const [activeTab, setActiveTab] = useState("list");
  const [searchText, setSearchText] = useState("");
  const [submissionSearch, setSubmissionSearch] = useState("");

  const [editingAssignment, setEditingAssignment] = useState(null);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [assignmentLink, setAssignmentLink] = useState("");

  const [studentLinks, setStudentLinks] = useState({});

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
    const unsubAssignments = onSnapshot(
      collection(db, "assignments"),
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

        setAssignments(data);
      },
      (error) => {
        console.error("Assignments load error:", error);
      }
    );

    const unsubSubmissions = onSnapshot(
      collection(db, "assignmentSubmissions"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        data.sort((a, b) => {
          const aTime = a.submittedAt?.seconds || 0;
          const bTime = b.submittedAt?.seconds || 0;
          return bTime - aTime;
        });

        setSubmissions(data);
      },
      (error) => {
        console.error("Submissions load error:", error);
      }
    );

    return () => {
      unsubAssignments();
      unsubSubmissions();
    };
  }, []);

  const canManage = user?.role === "teacher" || user?.role === "admin";
  const isStudent = user?.role === "student";

  const filteredAssignments = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    if (!text) return assignments;

    return assignments.filter((item) => {
      const searchable = [
        item.title,
        item.course,
        item.deadline,
        item.description,
        item.createdByName,
        item.createdBy,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(text);
    });
  }, [assignments, searchText]);

  const filteredSubmissions = useMemo(() => {
    const text = submissionSearch.toLowerCase().trim();

    if (!text) return submissions;

    return submissions.filter((item) => {
      const searchable = [
        item.assignmentTitle,
        item.assignmentCourse,
        item.studentName,
        item.studentEmail,
        item.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(text);
    });
  }, [submissions, submissionSearch]);

  const mySubmissionCount = submissions.filter(
    (item) => item.studentUid === user?.uid
  ).length;

  const reviewedCount = submissions.filter(
    (item) => item.status === "reviewed"
  ).length;

  const getMySubmission = (assignmentId) => {
    return submissions.find(
      (item) => item.assignmentId === assignmentId && item.studentUid === user?.uid
    );
  };

  const getSubmissionCount = (assignmentId) => {
    return submissions.filter((item) => item.assignmentId === assignmentId).length;
  };

  const resetForm = () => {
    setEditingAssignment(null);
    setTitle("");
    setCourse("");
    setDeadline("");
    setDescription("");
    setAssignmentLink("");
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();

    if (!title || !course || !deadline || !description) {
      alert("Please fill title, course, deadline and description.");
      return;
    }

    try {
      setSaving(true);

      if (editingAssignment) {
        await updateDoc(doc(db, "assignments", editingAssignment.id), {
          title,
          course,
          deadline,
          description,
          assignmentLink,
          updatedAt: serverTimestamp(),
        });

        alert("Assignment updated successfully.");
      } else {
        await addDoc(collection(db, "assignments"), {
          title,
          course,
          deadline,
          description,
          assignmentLink,
          createdByName: user.name || "Teacher",
          createdBy: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        alert("Assignment created successfully.");
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

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title || "");
    setCourse(assignment.course || "");
    setDeadline(assignment.deadline || "");
    setDescription(assignment.description || "");
    setAssignmentLink(assignment.assignmentLink || "");
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAssignment = async (assignmentId) => {
    const agree = window.confirm("Delete this assignment?");
    if (!agree) return;

    try {
      await deleteDoc(doc(db, "assignments", assignmentId));
      alert("Assignment deleted.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleStudentLinkChange = (assignmentId, value) => {
    setStudentLinks((prev) => ({
      ...prev,
      [assignmentId]: value,
    }));
  };

  const handleSubmitAssignment = async (assignment) => {
    const link = studentLinks[assignment.id]?.trim();

    if (!link) {
      alert("Please paste your Google Drive assignment link.");
      return;
    }

    try {
      setSubmittingId(assignment.id);

      await setDoc(doc(db, "assignmentSubmissions", `${assignment.id}_${user.uid}`), {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        assignmentCourse: assignment.course,
        studentUid: user.uid,
        studentName: user.name || "Student",
        studentEmail: user.email,
        submissionLink: link,
        status: "submitted",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStudentLinks((prev) => ({
        ...prev,
        [assignment.id]: "",
      }));

      alert("Assignment submitted successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSubmittingId("");
    }
  };

  const handleMarkReviewed = async (submissionId) => {
    try {
      await updateDoc(doc(db, "assignmentSubmissions", submissionId), {
        status: "reviewed",
        reviewedAt: serverTimestamp(),
      });

      alert("Submission marked as reviewed.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    const agree = window.confirm("Delete this student submission?");
    if (!agree) return;

    try {
      await deleteDoc(doc(db, "assignmentSubmissions", submissionId));
      alert("Submission deleted.");
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
      <div className="asm-page">
        <style>{styles}</style>
        <div className="asm-empty-card">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="asm-page">
      <style>{styles}</style>

      <div className="asm-container">
        <div className="asm-top-card">
          <div className="asm-top-icon">📝</div>

          <div>
            <h1>Assignments</h1>
            <p>
              Real-time assignments, teacher instructions, student submissions,
              and review tracking.
            </p>
          </div>
        </div>

        <div className="asm-stats-grid">
          <div className="asm-stat-card">
            <span>Total Assignments</span>
            <h2>{assignments.length}</h2>
          </div>

          <div className="asm-stat-card">
            <span>Total Submissions</span>
            <h2>{submissions.length}</h2>
          </div>

          <div className="asm-stat-card">
            <span>{isStudent ? "My Submissions" : "Reviewed"}</span>
            <h2>{isStudent ? mySubmissionCount : reviewedCount}</h2>
          </div>
        </div>

        {canManage && (
          <div className="asm-tabs">
            <button
              className={activeTab === "list" ? "active" : ""}
              onClick={() => setActiveTab("list")}
            >
              Assignment List
            </button>

            <button
              className={activeTab === "create" ? "active" : ""}
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
            >
              {editingAssignment ? "Update Assignment" : "Create Assignment"}
            </button>

            <button
              className={activeTab === "submissions" ? "active" : ""}
              onClick={() => setActiveTab("submissions")}
            >
              Student Submissions
            </button>
          </div>
        )}

        {canManage && activeTab === "create" && (
          <div className="asm-form-card">
            <div className="asm-section-head">
              <h2>{editingAssignment ? "Update Assignment" : "Create Assignment"}</h2>
              <p>
                Add assignment instructions and optional Google Drive or PDF link.
              </p>
            </div>

            <form className="asm-form-grid" onSubmit={handleSaveAssignment}>
              <div className="asm-field">
                <label>Assignment Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Database Lab Report"
                  required
                />
              </div>

              <div className="asm-field">
                <label>Course / Subject</label>
                <input
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Example: CSE 2201"
                  required
                />
              </div>

              <div className="asm-field">
                <label>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="asm-field asm-full">
                <label>Assignment File Link optional</label>
                <input
                  value={assignmentLink}
                  onChange={(e) => setAssignmentLink(e.target.value)}
                  placeholder="Paste Google Drive / PDF / file link"
                />
              </div>

              <div className="asm-field asm-full">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write assignment instructions..."
                  required
                />
              </div>

              <div className="asm-form-actions">
                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingAssignment
                    ? "Update Assignment"
                    : "Create Assignment"}
                </button>

                {editingAssignment && (
                  <button
                    type="button"
                    className="asm-cancel-btn"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {(!canManage || activeTab === "list") && (
          <>
            <div className="asm-section-row">
              <div className="asm-section-head">
                <h2>Assignment List</h2>
                <p>Students can view assignments and submit work links.</p>
              </div>

              <input
                className="asm-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search assignments..."
              />
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="asm-empty-card">No assignment found.</div>
            ) : (
              <div className="asm-card-grid">
                {filteredAssignments.map((assignment) => {
                  const mySubmission = getMySubmission(assignment.id);
                  const submissionCount = getSubmissionCount(assignment.id);

                  return (
                    <div className="asm-item-card" key={assignment.id}>
                      <div className="asm-card-top">
                        <div className="asm-card-icon">📝</div>
                        <span className="asm-chip">Due: {assignment.deadline}</span>
                      </div>

                      <h3>{assignment.title}</h3>

                      <div className="asm-course">{assignment.course}</div>

                      <p>{assignment.description}</p>

                      <div className="asm-info-list">
                        <div>
                          <span>Created by</span>
                          <strong>{assignment.createdByName || "Teacher"}</strong>
                        </div>

                        {canManage && (
                          <div>
                            <span>Submissions</span>
                            <strong>{submissionCount}</strong>
                          </div>
                        )}
                      </div>

                      {assignment.assignmentLink && (
                        <button
                          className="asm-dark-btn"
                          type="button"
                          onClick={() => openLink(assignment.assignmentLink)}
                        >
                          Open Assignment File
                        </button>
                      )}

                      {isStudent && (
                        <div className="asm-submit-box">
                          {mySubmission && (
                            <div className="asm-submitted-box">
                              <span>Status</span>
                              <strong>{mySubmission.status}</strong>

                              <button
                                type="button"
                                onClick={() => openLink(mySubmission.submissionLink)}
                              >
                                View My Submission
                              </button>
                            </div>
                          )}

                          <input
                            value={studentLinks[assignment.id] || ""}
                            onChange={(e) =>
                              handleStudentLinkChange(assignment.id, e.target.value)
                            }
                            placeholder={
                              mySubmission
                                ? "Paste new link to update submission"
                                : "Paste your Google Drive assignment link"
                            }
                          />

                          <button
                            type="button"
                            disabled={submittingId === assignment.id}
                            onClick={() => handleSubmitAssignment(assignment)}
                          >
                            {submittingId === assignment.id
                              ? "Submitting..."
                              : mySubmission
                              ? "Update Submission"
                              : "Submit Assignment"}
                          </button>
                        </div>
                      )}

                      {canManage && (
                        <div className="asm-action-row">
                          <button
                            type="button"
                            onClick={() => handleEditAssignment(assignment)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="asm-delete-btn"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {canManage && activeTab === "submissions" && (
          <>
            <div className="asm-section-row">
              <div className="asm-section-head">
                <h2>Student Submissions</h2>
                <p>Open, review, search, and manage submitted assignment links.</p>
              </div>

              <input
                className="asm-search"
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                placeholder="Search submissions..."
              />
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="asm-empty-card">No student submission found.</div>
            ) : (
              <div className="asm-table-card">
                <div className="asm-table">
                  <div className="asm-row asm-head">
                    <div>Student</div>
                    <div>Email</div>
                    <div>Assignment</div>
                    <div>Status</div>
                    <div>Submitted</div>
                    <div>Action</div>
                  </div>

                  {filteredSubmissions.map((submission) => (
                    <div className="asm-row" key={submission.id}>
                      <div>{submission.studentName || "Student"}</div>
                      <div>{submission.studentEmail || "N/A"}</div>
                      <div>{submission.assignmentTitle || "N/A"}</div>
                      <div>{submission.status || "submitted"}</div>
                      <div>{formatDate(submission.submittedAt)}</div>

                      <div className="asm-table-actions">
                        <button
                          type="button"
                          onClick={() => openLink(submission.submissionLink)}
                        >
                          Open
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkReviewed(submission.id)}
                        >
                          Review
                        </button>

                        <button
                          type="button"
                          className="asm-delete-small"
                          onClick={() => handleDeleteSubmission(submission.id)}
                        >
                          Delete
                        </button>
                      </div>
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
  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: Arial, sans-serif;
  }

  .asm-page {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(187, 247, 208, 0.6), transparent 34%),
      radial-gradient(circle at bottom right, rgba(167, 243, 208, 0.7), transparent 35%),
      linear-gradient(135deg, #f8fafc, #ffffff, #ecfdf5);
  }

  .asm-container {
    max-width: 1120px;
    margin: 0 auto;
  }

  .asm-top-card {
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

  .asm-top-icon {
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

  .asm-top-card h1 {
    margin: 0;
    color: #0f172a;
    font-size: 36px;
    font-weight: 900;
  }

  .asm-top-card p {
    margin: 7px 0 0;
    color: #64748b;
    line-height: 24px;
  }

  .asm-stats-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .asm-stat-card,
  .asm-form-card,
  .asm-item-card,
  .asm-table-card,
  .asm-empty-card {
    background: white;
    border: 1px solid #e2e8f0;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  }

  .asm-stat-card {
    border-radius: 22px;
    padding: 20px;
    text-align: center;
  }

  .asm-stat-card span {
    color: #64748b;
    font-weight: 800;
    font-size: 14px;
  }

  .asm-stat-card h2 {
    margin: 10px 0 0;
    color: #16a34a;
    font-size: 34px;
    font-weight: 900;
  }

  .asm-tabs {
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

  .asm-tabs button {
    border: none;
    border-radius: 16px;
    padding: 13px;
    background: transparent;
    color: #64748b;
    font-weight: 900;
    cursor: pointer;
  }

  .asm-tabs button.active {
    background: #16a34a;
    color: white;
  }

  .asm-form-card {
    margin-top: 18px;
    border-radius: 26px;
    padding: 24px;
  }

  .asm-section-head {
    margin-top: 24px;
  }

  .asm-form-card .asm-section-head {
    margin-top: 0;
    margin-bottom: 18px;
  }

  .asm-section-head h2 {
    margin: 0;
    color: #0f172a;
    font-size: 28px;
    font-weight: 900;
  }

  .asm-section-head p {
    margin: 8px 0 0;
    color: #64748b;
  }

  .asm-form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 13px;
  }

  .asm-field label {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 13px;
    font-weight: 900;
  }

  .asm-field input,
  .asm-field textarea,
  .asm-search,
  .asm-submit-box input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 16px;
    padding: 14px;
    font-size: 15px;
    outline: none;
    background: #f8fafc;
  }

  .asm-field textarea {
    min-height: 110px;
    resize: vertical;
  }

  .asm-field input:focus,
  .asm-field textarea:focus,
  .asm-search:focus,
  .asm-submit-box input:focus {
    background: white;
    border-color: #16a34a;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.13);
  }

  .asm-full {
    grid-column: 1 / -1;
  }

  .asm-form-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .asm-form-actions button,
  .asm-action-row button,
  .asm-submit-box button,
  .asm-table-actions button,
  .asm-submitted-box button {
    border: none;
    background: #16a34a;
    color: white;
    padding: 12px 16px;
    border-radius: 14px;
    font-weight: 900;
    cursor: pointer;
  }

  .asm-form-actions button:disabled,
  .asm-submit-box button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .asm-cancel-btn {
    background: #e2e8f0 !important;
    color: #334155 !important;
  }

  .asm-section-row {
    margin-top: 6px;
    display: grid;
    grid-template-columns: 1fr 320px;
    align-items: end;
    gap: 16px;
  }

  .asm-card-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .asm-item-card {
    border-radius: 26px;
    padding: 20px;
    transition: 0.24s ease;
  }

  .asm-item-card:hover {
    transform: translateY(-5px);
    border-color: #86efac;
    box-shadow: 0 22px 45px rgba(15, 118, 110, 0.14);
  }

  .asm-card-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .asm-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: #ecfdf5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .asm-chip {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #15803d;
    padding: 9px 12px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 13px;
  }

  .asm-item-card h3 {
    margin: 18px 0 8px;
    color: #0f172a;
    font-size: 24px;
    font-weight: 900;
  }

  .asm-course {
    color: #16a34a;
    font-size: 26px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .asm-item-card p {
    color: #475569;
    line-height: 24px;
  }

  .asm-info-list {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }

  .asm-info-list div,
  .asm-submitted-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 12px;
    border-radius: 16px;
  }

  .asm-info-list span,
  .asm-submitted-box span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .asm-info-list strong,
  .asm-submitted-box strong {
    color: #334155;
    overflow-wrap: anywhere;
  }

  .asm-dark-btn {
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

  .asm-submit-box {
    margin-top: 14px;
  }

  .asm-submit-box input {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .asm-submit-box button {
    width: 100%;
  }

  .asm-submitted-box {
    background: #ecfdf5;
    border-color: #bbf7d0;
  }

  .asm-submitted-box button {
    margin-top: 10px;
    width: 100%;
    background: #0f172a;
  }

  .asm-action-row {
    margin-top: 14px;
    display: flex;
    gap: 8px;
  }

  .asm-delete-btn,
  .asm-delete-small {
    background: #fee2e2 !important;
    color: #dc2626 !important;
  }

  .asm-table-card {
    margin-top: 16px;
    border-radius: 26px;
    padding: 16px;
    overflow-x: auto;
  }

  .asm-table {
    min-width: 980px;
  }

  .asm-row {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1.4fr 0.8fr 1.2fr 1.7fr;
    gap: 12px;
    padding: 14px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    align-items: center;
  }

  .asm-row:last-child {
    border-bottom: none;
  }

  .asm-head {
    background: #f0fdf4;
    color: #15803d;
    border-radius: 16px;
    border-bottom: none;
    font-weight: 900;
  }

  .asm-table-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .asm-empty-card {
    margin-top: 16px;
    border-radius: 24px;
    padding: 28px;
    text-align: center;
    color: #64748b;
  }

  @media (max-width: 900px) {
    .asm-top-card {
      grid-template-columns: 72px 1fr;
    }

    .asm-stats-grid,
    .asm-form-grid,
    .asm-section-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .asm-tabs {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .asm-page {
      padding: 14px;
    }

    .asm-top-card {
      grid-template-columns: 1fr;
      text-align: center;
      justify-items: center;
      border-radius: 24px;
    }

    .asm-top-card h1 {
      font-size: 32px;
    }

    .asm-action-row {
      flex-direction: column;
    }
  }
`;

export default Assignments;