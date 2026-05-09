import { useNavigate, useParams } from "react-router-dom";

const materials = [
  {
    id: 1,
    subject: "CSE-221",
    title: "Data Structure Lecture Note",
    teacher: "Mr. Rahman",
    uploadDate: "2026-06-03",
    description: "Lecture note on array, linked list, stack, and queue.",
  },
  {
    id: 2,
    subject: "CSE-321",
    title: "Database Normalization PDF",
    teacher: "Ms. Farhana",
    uploadDate: "2026-06-04",
    description: "Study material about normalization and ER diagram.",
  },
  {
    id: 3,
    subject: "CSE-111",
    title: "Programming Basic Notes",
    teacher: "Mr. Karim",
    uploadDate: "2026-06-06",
    description: "Basic programming notes for beginner students.",
  },
];

const StudyMaterialDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const item = materials.find((data) => data.id === Number(id));

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <button style={backBtn} onClick={() => navigate("/study-materials")}>
          ← Back to Materials
        </button>

        <h1 style={titleStyle}>{item ? item.title : "Material Not Found"}</h1>

        {item ? (
          <>
            <p style={textStyle}>{item.description}</p>
            <div style={badgeStyle}>Subject: {item.subject}</div>
            <div style={badgeStyle}>Teacher: {item.teacher}</div>
            <div style={badgeStyle}>Uploaded: {item.uploadDate}</div>
            <br />
            <button style={mainBtn} onClick={() => alert("Download feature will connect later.")}>
              Download File
            </button>
          </>
        ) : (
          <p style={textStyle}>This material does not exist.</p>
        )}
      </div>
    </div>
  );
};

const pageStyle = { minHeight: "100vh", background: "linear-gradient(135deg,#ecfdf5,#ffffff,#d1fae5)", padding: "24px", fontFamily: "Arial, sans-serif" };
const boxStyle = { maxWidth: "800px", margin: "0 auto", background: "white", borderRadius: "30px", padding: "28px", boxShadow: "0 18px 45px rgba(15,118,110,0.14)" };
const backBtn = { border: "none", background: "#dcfce7", color: "#15803d", padding: "12px 18px", borderRadius: "14px", fontWeight: "900", cursor: "pointer" };
const titleStyle = { color: "#0f172a", fontSize: "32px", fontWeight: "900" };
const textStyle = { color: "#475569", lineHeight: "30px", fontSize: "16px" };
const badgeStyle = { display: "inline-block", marginRight: "10px", marginTop: "12px", background: "#f0fdf4", color: "#15803d", padding: "8px 14px", borderRadius: "999px", fontWeight: "900" };
const mainBtn = { marginTop: "18px", background: "#16a34a", color: "white", border: "none", padding: "13px 20px", borderRadius: "15px", fontWeight: "900", cursor: "pointer" };

export default StudyMaterialDetails;