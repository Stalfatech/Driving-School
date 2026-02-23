import React, { useState } from 'react';
import { 
  X, Car, Hash, Palette, MapPin, 
  Gauge, UserCircle, Edit3, Save, 
  ChevronDown, ShieldCheck, Trash2 
} from 'lucide-react';

const VehicleDetailModal = ({ vehicle, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...vehicle });

  // Instructor list filtered by location
  const instructorsByLocation = {
    "Burin": ["Jean Dupont", "Marc-André Leclaire"],
    "Grand Falls": ["Robert Smith", "Yuki Tanaka"],
    "Marystown": ["Sam Chen", "Maria Garcia"],
    "St. John’s / Mount Pearl": ["Sarah Miller", "Alex Rivera"]
  };

  const availableInstructors = instructorsByLocation[formData.location] || [];

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
              Asset <span className="text-[#008B8B]">Intelligence</span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">VIN: {formData.vin}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2.5 bg-[#008B8B]/10 text-[#008B8B] rounded-full hover:bg-[#008B8B] hover:text-white transition-all shadow-sm"
              >
                <Edit3 size={20}/>
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Save size={20}/>
              </button>
            )}
            <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-all">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide">
          
          {/* Primary Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataField 
              icon={<Car size={16}/>} 
              label="Vehicle Name" 
              value={formData.name} 
              isEditing={isEditing}
              onChange={(val) => setFormData({...formData, name: val})}
            />
            <DataField 
              icon={<Hash size={16}/>} 
              label="Plate Number" 
              value={formData.plate} 
              isEditing={isEditing}
              className="uppercase"
              onChange={(val) => setFormData({...formData, plate: val})}
            />
            <DataField 
              icon={<Palette size={16}/>} 
              label="Color" 
              value={formData.color || 'Not Specified'} 
              isEditing={isEditing}
              onChange={(val) => setFormData({...formData, color: val})}
            />
            <DataField 
              icon={<Gauge size={16}/>} 
              label="Mileage (KM)" 
              value={formData.km} 
              isEditing={isEditing}
              type="number"
              onChange={(val) => setFormData({...formData, km: val})}
            />
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Location & Instructor Assignment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} className="text-[#008B8B]"/> Branch Location
              </label>
              {isEditing ? (
                <select 
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#008B8B]/30"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value, instructor: 'Unassigned'})}
                >
                  <option>Burin</option>
                  <option>Grand Falls</option>
                  <option>Marystown</option>
                  <option>St. John’s / Mount Pearl</option>
                </select>
              ) : (
                <p className="text-sm font-bold dark:text-white px-1">{formData.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCircle size={14} className="text-[#008B8B]"/> Assigned Instructor
              </label>
              <select 
                disabled={!isEditing}
                className={`w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#008B8B]/30 appearance-none ${!isEditing ? 'text-slate-500' : 'text-[#008B8B]'}`}
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
              >
                <option value="Unassigned">Select Instructor...</option>
                {availableInstructors.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Insurance Preview (Static Placeholder) */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <p className="text-[9px] font-black text-[#008B8B] uppercase tracking-[0.2em] mb-1">Compliance Document</p>
              <h4 className="text-lg font-bold italic uppercase tracking-tight">Insurance_Policy.pdf</h4>
              <button className="mt-3 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all">View Document</button>
            </div>
            <ShieldCheck size={80} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          {/* Delete Option (Only in Edit Mode) */}
          {isEditing && (
            <button className="w-full py-4 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all">
              <Trash2 size={16}/> Decommission Asset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for clean data rendering
const DataField = ({ icon, label, value, isEditing, onChange, type="text", className="" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <span className="text-[#008B8B]">{icon}</span> {label}
    </label>
    {isEditing ? (
      <input 
        type={type}
        className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <p className={`text-sm font-bold text-slate-800 dark:text-white px-1 ${className}`}>{value}</p>
    )}
  </div>
);

export default VehicleDetailModal;