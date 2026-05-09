import FirebaseResourcePage from "../assets/components/FirebaseResourcePage.jsx";

const ClassRoutine = () => {
  return (
    <FirebaseResourcePage
      title="Class Routine"
      subtitle="class routine loaded."
      icon="📅"
      collectionName="classRoutines"
      fields={[
        {
          name: "day",
          placeholder: "Day",
          required: true,
        },
        {
          name: "time",
          placeholder: "Time",
          required: true,
        },
        {
          name: "subject",
          placeholder: "Subject",
          required: true,
        },
        {
          name: "teacher",
          placeholder: "Teacher",
          required: true,
        },
        {
          name: "room",
          placeholder: "Room",
          required: true,
        },
      ]}
    />
  );
};

export default ClassRoutine;