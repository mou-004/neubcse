import { useNavigate, useParams } from "react-router-dom";

const notices = [
  {
    id: 1,
    title: "New Semester Registration Open",
    date: "2026-06-01",
    uploadedBy: "Admin Office",
    description:
      "Students are requested to complete semester registration within the announced deadline.",
  },
  {
    id: 2,
    title: "Class Routine Updated",
    date: "2026-06-05",
    uploadedBy: "CSE Department",
    description: "The class routine for CSE students has been updated.",
  },
  {
    id: 3,
    title: "Assignment Submission Notice",
    date: "2026-06-08",
    uploadedBy: "Mr. Rahman",
    description: "All students must submit pending assignments before deadline.",
  },
];

const NoticeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const notice = notices.find((item) => item.id === Number(id));

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <button style={backBtn} onClick={() => navigate("/notices")}>
          ← Back to Notices
        </button>

        <h1 style={titleStyle}>
          {notice ? notice.title : "Notice Not Found"}
        </h1>

        {notice ? (
          <>
            <p style={textStyle}>{notice.description}</p>
            <div style={badgeStyle}>Date: {notice.date}</div>
            <div style={badgeStyle}>Uploaded By: {notice.uploadedBy}</div>
          </>
        ) : (
          <p style={textStyle}>This notice does not exist.</p>
        )}
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #ecfdf5, #ffffff, #d1fae5)",
  padding: "24px",
  fontFamily: "Arial, sans-serif",
};

const boxStyle = {
  maxWidth: "800px",
  margin: "0 auto",
  background: "white",
  borderRadius: "30px",
  padding: "28px",
  boxShadow: "0 18px 45px rgba(15,118,110,0.14)",
};

const backBtn = {
  border: "none",
  background: "#dcfce7",
  color: "#15803d",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: "900",
  cursor: "pointer",
};

const titleStyle = {
  color: "#0f172a",
  fontSize: "32px",
  fontWeight: "900",
};

const textStyle = {
  color: "#475569",
  lineHeight: "30px",
  fontSize: "16px",
};

const badgeStyle = {
  display: "inline-block",
  marginRight: "10px",
  marginTop: "12px",
  background: "#f0fdf4",
  color: "#15803d",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "900",
};

export default NoticeDetails;