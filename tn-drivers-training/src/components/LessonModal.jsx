import React from 'react';

const LessonModal = ({ lesson, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            {lesson.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{lesson.name}</h3>
                            <span className="text-xs text-slate-500 uppercase tracking-widest">{lesson.type}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-auto space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Logistics</h4>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                                <div className="flex gap-3">
                                    <span className="material-symbols-outlined text-primary">location_on</span>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pickup</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium text-xs">123 jasper ave</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Assignment</h4>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Instructor</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white">
                                    <option>Sarah Smith</option>
                                    <option>David Chen</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                    <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20">Update Dispatch</button>
                </div>
            </div>
        </div>
    );
};

export default LessonModal;