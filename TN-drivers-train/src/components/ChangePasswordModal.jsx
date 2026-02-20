import React, { useState } from "react";

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match!");
      return;
    }
    console.log("Change Password:", { currentPassword, newPassword });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4 text-center">Change Password</h2>

        <div className="flex flex-col space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800"
          />

          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleUpdate}
              className="flex-1 py-2 bg-teal text-white rounded-lg"
            >
              Update
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-300 text-black rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;