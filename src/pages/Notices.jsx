import FirebaseResourcePage from "../assets/components/FirebaseResourcePage.jsx";

const Notices = () => {
  return (
    <FirebaseResourcePage
      title="Notices"
      subtitle=" Notices loaded."
      icon="🔔"
      collectionName="notices"
      fields={[
        {
          name: "title",
          placeholder: "Notice Title",
          required: true,
        },
        {
          name: "description",
          placeholder: "Description",
          required: true,
        },
        {
          name: "date",
          placeholder: "Publish Date",
          type: "date",
          required: true,
        },
        {
          name: "uploadedBy",
          placeholder: "Uploaded By",
          required: true,
        },
      ]}
    />
  );
};

export default Notices;