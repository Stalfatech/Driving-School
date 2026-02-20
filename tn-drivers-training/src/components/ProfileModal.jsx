import React, { useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

const ProfileModal = ({ onClose }) => {
  // Dummy user data (replace with API later)
  const [user, setUser] = useState({
    username: "Admin",
    email: "teranovaAdmin@gmail.com.com",
    profilePicture:
      "https://ui-avatars.com/api/?name=Admin&background=003366&color=fff",
  });

  const [editing, setEditing] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // (replace with API call later)
  const handleSave = () => {
    console.log("Updated user:", user);
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-red-500"
        >
          ✕
        </button>

        {/* Header Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={user.profilePicture}
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-teal"
            />

            {/* Edit camra Icon */}
            {editing && (
              <div className="absolute bottom-0 right-0 bg-teal p-1 rounded-full cursor-pointer">
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () =>
                          setUser({
                            ...user,
                            profilePicture: reader.result,
                          });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7h4l2-3h6l2 3h4a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1zM12 11a3 3 0 100 6 3 3 0 000-6z"
                      />
                    </svg>




                </label>
              </div>
            )}
          </div>

          {/* Username */}
          {editing ? (
            <input
              type="text"
              value={user.username}
              onChange={(e) =>
                setUser({ ...user, username: e.target.value })
              }
              className="w-full text-center px-4 py-2 rounded-lg border dark:bg-slate-800"
            />
          ) : (
            <h2 className="text-xl font-bold">Welcome, {user.username}</h2>
          )}

          {/* Email */}
          <p className="text-sm text-slate-500">{user.email}</p>

          {/* Action Buttons */}
          <div className="flex flex-col w-full space-y-2 mt-2">
            {editing ? (
              <button
                onClick={handleSave}
                className="w-full py-2 bg-teal text-white rounded-lg"
              >
                Save Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-2 bg-teal text-white rounded-lg"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setChangePasswordOpen(true)}
                  className="w-full py-2 bg-red-500 text-white rounded-lg"
                >
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        {changePasswordOpen && (
          <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
