import React, { useState } from "react";

export default function AddStudentModal({ onClose, onAdd, packages = [], instructors = [] }) {
  const [name, setName] = useState("");
  const [pkg, setPkg] = useState(packages[0]?.name || "Basic");
  const [inst, setInst] = useState("");
  const [status, setStatus] = useState("Active");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAdd({
      id: Date.now(),
      name,
      package: pkg,
      instructor: inst,
      progress: 0,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 transition-colors">
        
        <div className="bg-indigo-600 p-8 text-white relative">
          <h3 className="text-2xl font-black">Register Student</h3>
          <p className="text-indigo-100 text-sm">Create a new entry in the network</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 font-bold text-white hover:text-gray-200 transition"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3 outline-none transition-all dark:text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Package</label>
              <select
                value={pkg}
                onChange={(e) => setPkg(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none dark:text-white border-2 border-transparent focus:border-indigo-500"
              >
                {packages.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Instructor</label>
              <select
                value={inst}
                onChange={(e) => setInst(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none dark:text-white border-2 border-transparent focus:border-indigo-500"
              >
                <option value="">Not Assigned</option>
                {instructors.map(i => <option key={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none dark:text-white border-2 border-transparent focus:border-indigo-500"
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
            >
              Confirm Entry
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
