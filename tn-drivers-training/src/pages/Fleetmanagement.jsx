import React, { useState, useMemo, useEffect } from 'react';
import VehicleDetailModal from '../components/VehicleDetailModal';
import RegisterVehicleModal from '../components/RegisterVehicleModal';
import Pagination from '../components/Pagination';
import {
    Search, Car, MapPin, User, Plus,
    ChevronRight, Filter, AlertTriangle, ShieldAlert, Loader2, ScanEye, Download, CheckCircle
} from 'lucide-react';

const BASE_URL = 'http://127.0.0.1:8000/api';

const FleetManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('All');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    const getHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, locationFilter]);

    // ─── Fetch locations ───────────────────────────────────────────────────────
    const fetchLocations = async () => {
        try {
            const res = await fetch(`${BASE_URL}/locations`, { headers: getHeaders() });
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
            const res = await fetch(`${BASE_URL}/instructors`, { headers: getHeaders() });
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

            const carsJson        = await carsRes.json();
            const instructorsJson = await instructorsRes.json();
            const carsData        = carsJson.data || carsJson;
            const instructorsData = instructorsJson.data || instructorsJson;

            const instructorMap = {};
            if (Array.isArray(instructorsData)) {
                instructorsData.forEach(inst => {
                    if (inst.car_id) {
                        instructorMap[inst.car_id] = {
                            name: inst.user?.name || 'Unknown',
                            id:   inst.id
                        };
                    }
                });
            }

            if (Array.isArray(carsData)) {
                const normalized = carsData.map(car => {
                    const assignedInstructor = instructorMap[car.id];
                    return {
                        id:              car.id,
                        vin:             car.vin || car.id.toString(),
                        name:            car.car_name || car.name,
                        model:           car.model,
                        plate:           car.number_plate || car.plate,
                        location:        car.location?.name || car.location?.province_name || 'Unknown',
                        location_id:     car.location_id,
                        instructor:      assignedInstructor?.name || null,
                        instructor_id:   assignedInstructor?.id   || null,
                        winterReady:     car.winter_ready         || false,
                        status:          car.status               || 'Available',
                        km:              car.odometer             || '0',
                        color:           car.color                || '',
                        insuranceNo:     car.insurance_number     || '',
                        insuranceExpiry: car.insurance_expiry     || '',
                        rcNo:            car.rc_number            || '',
                        rcExpiry:        car.rc_expiry            || '',
                        carDocument:     car.car_document         || null,
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
        Promise.all([fetchLocations(), fetchCars(), fetchInstructors()]);
    }, []);

    // ─── Delete car ────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this asset?')) return;
        try {
            const res  = await fetch(`${BASE_URL}/cars/${id}`, { method: 'DELETE', headers: getHeaders() });
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

    // ─── Register vehicle ──────────────────────────────────────────────────────
    const handleRegister = async () => {
        await fetchCars();
        setIsRegisterOpen(false);
    };

    // ─── Update vehicle ────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        await fetchCars();
        setSelectedVehicle(null);
    };

    // ─── Expiry alert logic with status flags ────────────────────────────────────
    const getExpiryStatus = (dateString) => {
        if (!dateString) return null;
        const today      = new Date();
        const expiryDate = new Date(dateString);
        const diffDays   = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0)   return { status: 'expired', label: 'Expired', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' };
        if (diffDays <= 30) return { status: 'expiring', label: `${diffDays}d left`, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
        return { status: 'valid', label: 'Valid', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' };
    };

    // ─── Statistics ────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const filtered = locationFilter === 'All'
            ? vehicles
            : vehicles.filter(v => v.location === locationFilter);

        const total    = filtered.length;
        const assigned = filtered.filter(v => v.instructor !== null).length;
        const active   = filtered.filter(v => v.status === 'Available' || v.status === 'In Session').length;

        const today            = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiredCount = filtered.filter(v => {
            const ins = v.insuranceExpiry ? new Date(v.insuranceExpiry) : null;
            const rc  = v.rcExpiry        ? new Date(v.rcExpiry)        : null;
            return (ins && ins < today) || (rc && rc < today);
        }).length;

        const expiringSoonCount = filtered.filter(v => {
            const ins = v.insuranceExpiry ? new Date(v.insuranceExpiry) : null;
            const rc  = v.rcExpiry        ? new Date(v.rcExpiry)        : null;
            return (ins && ins >= today && ins <= thirtyDaysFromNow) ||
                   (rc  && rc  >= today && rc  <= thirtyDaysFromNow);
        }).length;

        return { total, assigned, active, serviceDueCount: expiredCount + expiringSoonCount, expiredCount };
    }, [vehicles, locationFilter]);

    // ─── Filtered & paginated ──────────────────────────────────────────────────
    const filteredVehicles = useMemo(() => vehicles.filter(veh => {
        const matchesLocation = locationFilter === 'All' || veh.location === locationFilter;
        const matchesSearch   =
            veh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (veh.plate && veh.plate.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesLocation && matchesSearch;
    }), [searchTerm, locationFilter, vehicles]);

    const paginatedVehicles = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredVehicles.slice(start, start + itemsPerPage);
    }, [filteredVehicles, currentPage]);

    // ─── Loading / error states ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Syncing Fleet...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                    <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
                    <button onClick={fetchCars} className="px-6 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-all">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">

            {/* HEADER */}
            <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                            Fleet <span className="text-teal-600 dark:text-teal-400">Management</span>
                        </h1>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                            Manage your fleet inventory, track maintenance, and monitor vehicle assignments
                        </p>
                    </div>
                    <div className="flex justify-end w-full md:w-auto">
                        <button
                            onClick={() => setIsRegisterOpen(true)}
                            className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Register Vehicle
                        </button>
                    </div>
                </div>

                <div className="flex flex-col w-full lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3 flex-1">
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                        >
                            <option value="All">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.name || loc.province_name}>
                                    {loc.name || loc.province_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or plate..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
                <div className="max-w-[1800px] mx-auto">

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Fleet"  value={stats.total}           color="text-slate-800 dark:text-white" />
                        <StatCard label="Active Units" value={stats.active}          color="text-slate-800 dark:text-white" />
                        <StatCard label="Service Due"  value={stats.serviceDueCount} color="text-amber-600 dark:text-amber-400" />
                        <StatCard
                            label="Alerts"
                            value={stats.expiredCount}
                            color={stats.expiredCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}
                            pulse={stats.expiredCount > 0}
                        />
                    </div>

                    {/* Vehicle Grid */}
                    {filteredVehicles.length === 0 ? (
                        <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                            <Car size={56} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No vehicles found matching your filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {paginatedVehicles.map(veh => {
                                    const insuranceStatus = getExpiryStatus(veh.insuranceExpiry);
                                    const rcStatus = getExpiryStatus(veh.rcExpiry);
                                    
                                    // Determine overall status
                                    const hasExpired = insuranceStatus?.status === 'expired' || rcStatus?.status === 'expired';
                                    const hasExpiring = (insuranceStatus?.status === 'expiring' || rcStatus?.status === 'expiring') && !hasExpired;
                                    const allValid = (!veh.insuranceExpiry || insuranceStatus?.status === 'valid') && (!veh.rcExpiry || rcStatus?.status === 'valid');
                                    
                                    const isAssigned = veh.instructor !== null;

                                    const cardBgClass     = hasExpired ? 'bg-red-50/50 dark:bg-red-950/20' : hasExpiring ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'bg-white dark:bg-slate-900';
                                    const cardBorderClass = hasExpired ? 'border-red-300 dark:border-red-700' : hasExpiring ? 'border-amber-300 dark:border-amber-700' : 'border-slate-200 dark:border-slate-800';
                                    const hoverClass      = hasExpired ? 'hover:border-red-400' : hasExpiring ? 'hover:border-amber-400' : 'hover:border-teal-300 dark:hover:border-teal-700';
                                    const iconClass       = hasExpired ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : hasExpiring ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-500' : 'bg-teal-100 dark:bg-teal-900/20 text-teal-600 group-hover:bg-teal-200';
                                    const nameClass       = hasExpired ? 'text-red-700 dark:text-red-400' : hasExpiring ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400';
                                    const btnClass        = hasExpired ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25' : hasExpiring ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/25';
                                    const pinClass        = hasExpired ? 'text-red-500' : hasExpiring ? 'text-amber-500' : 'text-teal-500';

                                    let statusText  = veh.status;
                                    let statusColor = hasExpired
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        : hasExpiring
                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                        : veh.status === 'Available'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : veh.status === 'In Session'
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                                    if (hasExpired)      statusText = 'EXPIRED';
                                    if (hasExpiring && !hasExpired) statusText = 'EXPIRING SOON';

                                    return (
                                        <div key={veh.id} className={`${cardBgClass} p-5 rounded-2xl border ${cardBorderClass} shadow-sm ${hoverClass} hover:-translate-y-1 transition-all duration-300 flex flex-col group`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${iconClass}`}>
                                                    <Car size={24} />
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>{statusText}</span>
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${isAssigned ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                        {isAssigned ? 'ASSIGNED' : 'UNASSIGNED'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h3 className={`text-lg font-bold transition-colors duration-300 ${nameClass}`}>{veh.name}</h3>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[13px] font-mono font-semibold text-slate-600 dark:text-slate-400">{veh.plate}</span>
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[13px] font-mono font-semibold text-slate-600 dark:text-slate-400">{parseInt(veh.km).toLocaleString()} KM</span>
                                                </div>
                                            </div>

                                            {/* Document Status Section - Only shows badges when there are issues OR all valid */}
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {veh.insuranceExpiry && (
                                                    insuranceStatus?.status === 'expired' ? (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                            <ShieldAlert size={12} /> INS: {insuranceStatus.label}
                                                        </div>
                                                    ) : insuranceStatus?.status === 'expiring' ? (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                            <AlertTriangle size={12} /> INS: {insuranceStatus.label}
                                                        </div>
                                                    ) : null
                                                )}
                                                
                                                {veh.rcExpiry && (
                                                    rcStatus?.status === 'expired' ? (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                            <AlertTriangle size={12} /> RC: {rcStatus.label}
                                                        </div>
                                                    ) : rcStatus?.status === 'expiring' ? (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                            <AlertTriangle size={12} /> RC: {rcStatus.label}
                                                        </div>
                                                    ) : null
                                                )}
                                                
                                                {/* Show "All Clear" badge only when both documents exist and are valid, and no expiring/expired issues */}
                                                {allValid && veh.insuranceExpiry && veh.rcExpiry && (
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                        <CheckCircle size={12} /> All Clear
                                                    </div>
                                                )}
                                                
                                                {/* If one document is missing, don't show all clear */}
                                                {allValid && (!veh.insuranceExpiry || !veh.rcExpiry) && (
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                        <CheckCircle size={12} /> Documents Valid
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <MapPin size={14} className={`transition-colors duration-300 ${pinClass}`} />
                                                    <span className="text-sm font-medium">{veh.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <User size={14} className={isAssigned ? 'text-teal-500' : 'text-slate-400'} />
                                                    <span className="text-sm font-medium">{isAssigned ? veh.instructor : 'Unassigned'}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedVehicle(veh)}
                                                className={`mt-5 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 text-white shadow-lg ${btnClass}`}
                                            >
                                                <span>Manage Asset</span>
                                                <ChevronRight size={16} className="transition-all duration-300 group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredVehicles.length > itemsPerPage && (
                                <div className="flex justify-center pt-8 pb-4">
                                    <Pagination
                                        totalItems={filteredVehicles.length}
                                        itemsPerPage={itemsPerPage}
                                        currentPage={currentPage}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* MODALS */}
            {isRegisterOpen && (
                <RegisterVehicleModal
                    locations={locations}
                    onClose={() => setIsRegisterOpen(false)}
                    onRegister={handleRegister}
                />
            )}
            {selectedVehicle && (
                <VehicleDetailModal
                    vehicle={selectedVehicle}
                    locations={locations}
                    onClose={() => setSelectedVehicle(null)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, pulse = false }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            {label}
            {pulse && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
        </p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

export default FleetManagement;