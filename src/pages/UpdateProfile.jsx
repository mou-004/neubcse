import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const UpdateProfile = () => {
  const { userData, updateUserInfo } = useAuth();
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const photoURL = e.target.photoURL.value;

    try {
      await updateUserInfo({ name, photoURL });
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <form onSubmit={handleUpdate} className="card-body">
          <h2 className="text-3xl font-bold text-center">Update Profile</h2>

          <label className="form-control">
            <span className="label-text">Name</span>
            <input
              name="name"
              defaultValue={userData?.name}
              type="text"
              className="input input-bordered"
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text">Profile Image URL</span>
            <input
              name="photoURL"
              defaultValue={userData?.photoURL}
              type="url"
              className="input input-bordered"
              required
            />
          </label>

          <button className="btn btn-primary mt-4">Update Information</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;