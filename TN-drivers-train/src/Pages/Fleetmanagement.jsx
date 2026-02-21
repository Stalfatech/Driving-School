import React, { useState, useMemo } from 'react';
import VehicleDetailModal from '../components/VehicleDetailModal'; 
import { 
  Search, Car, MapPin, User, 
  Settings, Snowflake, Plus, Download, ChevronRight, Filter
} from 'lucide-react';

const FleetManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [vehicles] = useState([
    { 
      vin: "2T1BURHE3NC123456", 
      name: "2022 Toyota Corolla", 
      plate: "V-882", 
      location: "Burin", 
      instructor: "Jean Dupont",
      winterReady: true,
      status: "Available"
    },
    { 
      vin: "1HGCP2F85NA987654", 
      name: "2023 Honda Civic", 
      plate: "V-104", 
      location: "St. John’s / Mount Pearl", 
      instructor: "Sarah Miller",
      winterReady: false,
      status: "In Session"
    },
    { 
      vin: "JM1BP1U74M1654321", 
      name: "2021 Mazda 3", 
      plate: "V-229", 
      location: "Grand Falls", 
      instructor: "Robert Smith",
      winterReady: true,
      status: "Service Due"
    }
  ]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(veh => {
      const matchesLocation = locationFilter === 'All Locations' || veh.location === locationFilter;
      const matchesSearch = veh.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            veh.plate.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLocation && matchesSearch;
    });
  }, [searchTerm, locationFilter, vehicles]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      
      {/* 1. ADAPTIVE HEADER (Responsive Stacking) */}
      <header className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-40 gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-3 sm:py-2 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#008B8B]/50" 
              placeholder="Search by name or plate..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative flex-1 sm:w-56">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <select 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none appearance-none"
            >
              <option>All Locations</option>
              <option>Burin</option>
              <option>Grand Falls</option>
              <option>Marystown</option>
              <option>St. John’s / Mount Pearl</option>
            </select>
          </div>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-[#008B8B] px-6 py-3 sm:py-2.5 text-white rounded-xl shadow-lg shadow-[#008B8B]/20 active:scale-95 transition-all text-sm font-bold">
          <Plus size={20} /> <span>Register Vehicle</span>
        </button>
      </header>

      <main className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
              Vehicle <span className="text-[#008B8B]">Fleet</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">Asset tracking for all training branches.</p>
          </div>
        </div>

        {/* 2. RESPONSIVE GRID (1 col mobile, 2 col tablet, 3 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredVehicles.map(veh => (
            <div key={veh.vin} className="bg-white dark:bg-[#111827] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#008B8B]/40 transition-all flex flex-col justify-between h-full group">
              
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 dark:bg-[#1e293b] flex items-center justify-center text-[#008B8B] shadow-inner group-hover:scale-110 transition-transform">
                  <Car size={24} md:size={28} />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                    veh.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 
                    veh.status === 'Service Due' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20' : 
                    'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20'
                  }`}>
                    {veh.status}
                  </span>
                  {veh.winterReady && (
                    <div className="flex items-center gap-1 text-sky-500 dark:text-sky-400 font-bold text-[9px]">
                      <Snowflake size={12} /> WINTER READY
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-tight group-hover:text-[#008B8B] transition-colors">{veh.name}</h3>
                <div className="inline-flex mt-2 px-2.5 py-1 bg-slate-50 dark:bg-[#1e293b] rounded-lg border border-slate-100 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  PLATE: {veh.plate}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <MapPin size={14} className="text-[#008B8B] shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate">{veh.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <User size={14} className="text-[#008B8B] shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate">Handle: {veh.instructor}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedVehicle(veh)}
                className="mt-6 w-full py-3.5 bg-slate-50 dark:bg-slate-800/50 text-[#008B8B] dark:text-[#008B8B] hover:bg-[#008B8B] hover:text-white dark:hover:bg-[#008B8B] dark:hover:text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Manage Asset <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </main>

      {selectedVehicle && (
        <VehicleDetailModal 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
        />
      )}
    </div>
  );
};

export default FleetManagement;