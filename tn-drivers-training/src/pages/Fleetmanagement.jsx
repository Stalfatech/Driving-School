import React, { useState, useMemo, useEffect } from 'react';
import VehicleDetailModal from '../components/VehicleDetailModal';
import RegisterVehicleModal from '../components/RegisterVehicleModal';
import {
    Search, Car, MapPin, User, Plus,
    ChevronRight, Filter, AlertTriangle, ShieldAlert, Loader2
} from 'lucide-react';

const BASE_URL = 'http://127.0.0.1:8000/api'; 

const FleetManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('All Locations');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    const getHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });

    // ─── Fetch locations ───────────────────────────────────────────────────────
    const fetchLocations = async () => {
        try {
            const res = await fetch(`${BASE_URL}/locations`, {
                headers: getHeaders()
            });
            const json = await res.json();
            const locData = json.data || json;
            if (Array.isArray(locData)) setLocations(locData);
        } catch (err) {
            console.error('Failed to fetch locations:', err);
        }
    };

    // ─── Fetch instructors ─────────────────────────────────────────────────────
    const fetchInstructors = async () => {
        try {
            const res = await fetch(`${BASE_URL}/instructors`, {
                headers: getHeaders()
            });
            const json = await res.json();
            const instData = json.data || json;
            if (Array.isArray(instData)) setInstructors(instData);
        } catch (err) {
            console.error('Failed to fetch instructors:', err);
        }
    };

    // ─── Fetch cars ────────────────────────────────────────────────────────────
    const fetchCars = async () => {
        setLoading(true);
        setError(null);
        try {
            const [carsRes, instructorsRes] = await Promise.all([
                fetch(`${BASE_URL}/cars`, { headers: getHeaders() }),
                fetch(`${BASE_URL}/instructors`, { headers: getHeaders() })
            ]);

            if (!carsRes.ok) throw new Error(`Server responded with ${carsRes.status}`);

            const carsJson = await carsRes.json();
            const instructorsJson = await instructorsRes.json();
            
            const carsData = carsJson.data || carsJson;
            const instructorsData = instructorsJson.data || instructorsJson;

            // Create a map of car_id -> instructor for quick lookup
            const instructorMap = {};
            if (Array.isArray(instructorsData)) {
                instructorsData.forEach(inst => {
                    if (inst.car_id) {
                        instructorMap[inst.car_id] = {
                            name: inst.user?.name || 'Unknown',
                            id: inst.id
                        };
                    }
                });
            }

            if (Array.isArray(carsData)) {
                const normalized = carsData.map(car => {
                    // Check if this car is assigned to any instructor
                    const assignedInstructor = instructorMap[car.id];
                    
                    return {
                        id:              car.id,
                        vin:             car.vin || car.id.toString(),
                        name:            car.car_name || car.name,
                        plate:           car.number_plate || car.plate,
                        location:        car.location?.name || car.location?.province_name || 'Unknown',
                        location_id:     car.location_id,
                        instructor:      assignedInstructor?.name || null,
                        instructor_id:   assignedInstructor?.id || null,
                        winterReady:     car.winter_ready || false,
                        status:          car.status || 'Available',
                        km:              car.odometer || '0',
                        color:           car.color || '',
                        insuranceNo:     car.insurance_number || '',
                        insuranceExpiry: car.insurance_expiry || '',
                        rcNo:            car.rc_number || '',
                        rcExpiry:        car.rc_expiry || '',
                        carDocument:     car.car_document || null,
                    };
                });
                setVehicles(normalized);
            } else {
                setError('Failed to load vehicles. Invalid data format.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Network error. Ensure the backend is running and you are logged in.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.all([
            fetchLocations(),
            fetchCars()
        ]);
    }, []);

    // ─── Delete car ────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this asset?')) return;
        try {
            const res = await fetch(`${BASE_URL}/cars/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const json = await res.json();
            if (res.ok) {
                setVehicles(prev => prev.filter(v => v.id !== id));
                setSelectedVehicle(null);
            } else {
                alert(json.message || 'Failed to delete vehicle.');
            }
        } catch (err) {
            alert('Network error during deletion.');
        }
    };

    // ─── Expiry alert logic ────────────────────────────────────────────────────
    const getExpiryAlert = (dateString) => {
        if (!dateString) return null;
        const today = new Date();
        const expiryDate = new Date(dateString);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0)    return { label: 'Expired', color: 'text-rose-500 bg-rose-50 border-rose-100' };
        if (diffDays <= 30)  return { label: `Expires in ${diffDays}d`, color: 'text-orange-500 bg-orange-50 border-orange-100' };
        return null;
    };

    // ─── Calculate statistics based on location filter ─────────────────────────
    const stats = useMemo(() => {
        const filteredByLocation = locationFilter === 'All Locations' 
            ? vehicles 
            : vehicles.filter(v => v.location === locationFilter);

        const total = filteredByLocation.length;
        const assigned = filteredByLocation.filter(v => v.instructor && v.instructor !== null).length;
        const unassigned = total - assigned;
        const active = filteredByLocation.filter(v => v.status === 'Available' || v.status === 'active').length;
        
        return {
            total,
            assigned,
            unassigned,
            active,
            overallActive: vehicles.filter(v => v.status === 'Available' || v.status === 'active').length,
            overallAlerts: vehicles.filter(v => getExpiryAlert(v.insuranceExpiry) || getExpiryAlert(v.rcExpiry)).length
        };
    }, [vehicles, locationFilter]);

    // ─── Filtered vehicles ─────────────────────────────────────────────────────
    const filteredVehicles = useMemo(() => {
        return vehicles.filter(veh => {
            const matchesLocation = locationFilter === 'All Locations' || veh.location === locationFilter;
            const matchesSearch =
                veh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                veh.plate.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesLocation && matchesSearch;
        });
    }, [searchTerm, locationFilter, vehicles]);

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 overflow-hidden">

            {/* HEADER */}
            <header className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-20 gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                        <input
                            className="w-full pl-10 pr-4 py-3 sm:py-2 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#008B8B]/50 transition-all"
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
                            <option value="All Locations">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.name || loc.province_name}>
                                    {loc.name || loc.province_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[#008B8B] px-6 py-3 sm:py-2.5 text-white rounded-xl shadow-lg shadow-[#008B8B]/20 active:scale-95 transition-all text-sm font-bold"
                >
                    <Plus size={20} /> <span>Register Vehicle</span>
                </button>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
                
                {/* Location Header */}
                <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-[#008B8B]" />
                    <h2 className="text-lg font-black text-slate-700 dark:text-slate-300 uppercase">
                        {locationFilter === 'All Locations' ? 'All Locations' : `${locationFilter} Fleet`}
                    </h2>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Vehicles</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Active</p>
                        <p className="text-3xl font-black text-emerald-500">{stats.active}</p>
                    </div>
                    <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-black text-[#008B8B] uppercase tracking-widest mb-2">Assigned</p>
                        <p className="text-3xl font-black text-[#008B8B]">{stats.assigned}</p>
                    </div>
                    <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Unassigned</p>
                        <p className="text-3xl font-black text-amber-500">{stats.unassigned}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
                        Vehicle <span className="text-[#008B8B]">Fleet</span>
                    </h1>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Active</p>
                            <p className="text-xl font-black dark:text-white">{stats.overallActive}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                        <div className="text-right">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Alerts</p>
                            <p className="text-xl font-black text-rose-500">{stats.overallAlerts}</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="animate-spin text-[#008B8B]" size={40} />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Syncing Fleet...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-rose-500 font-bold mb-2">{error}</p>
                        <button onClick={fetchCars} className="text-xs underline text-slate-500">Try Refreshing</button>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-sm">
                        No vehicles found in this location
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
                        {filteredVehicles.map(veh => {
                            const insAlert = getExpiryAlert(veh.insuranceExpiry);
                            const rcAlert  = getExpiryAlert(veh.rcExpiry);
                            const isAssigned = veh.instructor && veh.instructor !== null;

                            return (
                                <div key={veh.id} className="bg-white dark:bg-[#111827] p-5 md:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#008B8B]/40 transition-all flex flex-col group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 dark:bg-[#1e293b] flex items-center justify-center text-[#008B8B] shadow-inner group-hover:scale-110 transition-transform">
                                            <Car size={26} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                                                veh.status === 'Available' || veh.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>{veh.status}</span>
                                            
                                            {/* Assignment Status Badge - Now correctly shows based on instructor's car_id */}
                                            <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                isAssigned
                                                    ? 'bg-[#008B8B]/10 text-[#008B8B] border-[#008B8B]/20'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {isAssigned ? 'ASSIGNED' : 'UNASSIGNED'}
                                            </span>
                                            
                                            {insAlert && (
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[8px] font-black uppercase ${insAlert.color}`}>
                                                    <ShieldAlert size={12} /> INS: {insAlert.label}
                                                </div>
                                            )}
                                            {rcAlert && (
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[8px] font-black uppercase ${rcAlert.color}`}>
                                                    <AlertTriangle size={12} /> RC: {rcAlert.label}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-tight">{veh.name}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-2.5 py-1 bg-slate-50 dark:bg-[#1e293b] rounded-lg border border-slate-100 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{veh.plate}</span>
                                            <span className="px-2.5 py-1 bg-slate-50 dark:bg-[#1e293b] rounded-lg border border-slate-100 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{veh.km} KM</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-auto">
                                        <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                                            <MapPin size={14} className="text-[#008B8B]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest truncate">{veh.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                                            <User size={14} className={`${isAssigned ? 'text-[#008B8B]' : 'text-amber-500'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest truncate">
                                                {isAssigned ? `Instructor: ${veh.instructor}` : 'Unassigned'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedVehicle(veh)}
                                        className="mt-8 w-full py-4 bg-slate-50 dark:bg-slate-800/50 text-[#008B8B] hover:bg-[#008B8B] hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                    >
                                        Manage Asset <ChevronRight size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* MODALS */}
            {isRegisterOpen && (
                <RegisterVehicleModal
                    locations={locations}
                    onClose={() => setIsRegisterOpen(false)}
                    onRegister={() => { fetchCars(); setIsRegisterOpen(false); }}
                />
            )}
            {selectedVehicle && (
                <VehicleDetailModal
                    vehicle={selectedVehicle}
                    locations={locations}
                    onClose={() => setSelectedVehicle(null)}
                    onUpdate={() => { fetchCars(); setSelectedVehicle(null); }}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default FleetManagement;