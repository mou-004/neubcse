import { useNavigate, useParams } from "react-router-dom";

const assignments = [
  {
    id: 1,
    title: "Linked List Assignment",
    subject: "CSE-221",
    deadline: "2026-06-10",
    teacher: "Mr. Rahman",
    description:
      "Complete linked list insertion, deletion, searching, and traversal problems.",
  },
  {
    id: 2,
    title: "Database ER Diagram",
    subject: "CSE-321",
    deadline: "2026-06-15",
    teacher: "Ms. Farhana",
    description:
      "Design an ER diagram for a university course registration system.",
  },
  {
    id: 3,
    title: "Programming Problem Set",
    subject: "CSE-111",
    deadline: "2026-06-18",
    teacher: "Mr. Karim",
    description:
      "Solve basic programming problems using condition, loop, and function.",
  },
];

const AssignmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const assignment = assignments.find((item) => item.id === Number(id));

  return (
    <div className="page">
      <style>
        {`
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

          .page {
            min-height: 100vh;
            background: linear-gradient(135deg, #ecfdf5, #ffffff, #d1fae5);
            padding: 24px;
          }

          .box {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 30px;
            padding: 28px;
            box-shadow: 0 18px 45px rgba(15,118,110,0.14);
            transition: 0.25s ease;
          }

          .box:hover {
            transform: translateY(-6px);
            box-shadow: 0 24px 55px rgba(15,118,110,0.22);
          }

          .back-btn {
            border: none;
            background: #dcfce7;
            color: #15803d;
            padding: 12px 18px;
            border-radius: 14px;
            font-weight: 900;
            cursor: pointer;
          }

          .title {
            color: #0f172a;
            font-size: 32px;
            font-weight: 900;
            margin-top: 24px;
          }

          .text {
            color: #475569;
            line-height: 30px;
            font-size: 16px;
          }

          .badge {
            display: inline-block;
            margin-right: 10px;
            margin-top: 12px;
            background: #f0fdf4;
            color: #15803d;
            padding: 8px 14px;
            border-radius: 999px;
            font-weight: 900;
          }

          .main-btn {
            margin-top: 20px;
            background: #16a34a;
            color: white;
            border: none;
            padding: 13px 20px;
            border-radius: 15px;
            font-weight: 900;
            cursor: pointer;
          }

          .main-btn:hover {
            background: #059669;
          }
        `}
      </style>

      <div className="box">
        <button className="back-btn" onClick={() => navigate("/assignments")}>
          ← Back to Assignments
        </button>

        <h1 className="title">
          {assignment ? assignment.title : "Assignment Not Found"}
        </h1>

        {assignment ? (
          <>
            <p className="text">{assignment.description}</p>

            <span className="badge">Subject: {assignment.subject}</span>
            <span className="badge">Teacher: {assignment.teacher}</span>
            <span className="badge">Deadline: {assignment.deadline}</span>

            <br />

            <button
              className="main-btn"
              onClick={() =>
                alert("Assignment file download will be connected later.")
              }
            >
              Download File
            </button>
          </>
        ) : (
          <p className="text">This assignment does not exist.</p>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;