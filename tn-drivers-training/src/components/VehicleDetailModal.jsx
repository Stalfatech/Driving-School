import React from 'react';
// Changed 'Tool' to 'Wrench'
import { X, Car, Wrench, Gauge, ShieldAlert, FileText, Snowflake } from 'lucide-react';

const VehicleDetailModal = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-blue-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Car size={24}/> Fleet Asset Details
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
            <X size={20}/>
          </button>
        </div>

        <div className="p-6 space-y-6">
           <div>
              <h3 className="text-xl font-bold dark:text-white">{vehicle.model}</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">VIN: {vehicle.vin}</p>
           </div>

           {/* Policy & Winter Readiness */}
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Insurance Policy</p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <FileText size={14}/> {vehicle.insurance}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Winter Readiness</p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <Snowflake size={14}/> {vehicle.winterReady ? 'Tires Fitted' : 'Summer Config'}
                </div>
              </div>
           </div>

           {/* Maintenance Section */}
           <div className="space-y-4">
              <h4 className="text-sm font-bold border-b dark:border-slate-700 pb-2 flex items-center gap-2 dark:text-white">
                <Wrench size={16} className="text-blue-600"/> Maintenance Logs
              </h4>
              <div className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Gauge size={16}/> Odometer Reading
                 </div>
                 <span className="font-bold dark:text-white">42,500 KM</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <ShieldAlert size={16} className="text-rose-500"/> Service Status
                 </div>
                 <span className="font-black text-rose-500 uppercase text-[10px]">Service Due Soon</span>
              </div>
           </div>

           <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              Schedule Maintenance Task
           </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;
