import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Shield, Award, Users, Clock, MapPin, 
  ChevronRight, Phone, Mail, CheckCircle,
  Calendar, UserCheck, Menu, X, Loader, Plus, Minus,
  Facebook, Instagram, Briefcase, Star, Sparkles
} from 'lucide-react';
import RegistrationPage from './RegistrationPage';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Real Canadian Driving FAQs
const faqs = [
  { 
    q: "What is the minimum age to start driving training?", 
    a: "In most Canadian provinces, you must be at least 16 years old to apply for your learner's permit (such as a G1 in Ontario or Class 7 in BC/Alberta). You can register for our courses once you hold a valid learner's permit." 
  },
  { 
    q: "Do I need my learner's permit before starting lessons?", 
    a: "Yes. While you can sometimes start online theory classes early, you must physically hold and carry a valid Canadian learner's licence before you are legally allowed to get behind the wheel for in-car instruction." 
  },
  { 
    q: "Will taking a driving course reduce my insurance rates?", 
    a: "Yes! Completing a Ministry/Provincial-approved driving course provides a certification history that is highly recognized by the Canadian insurance industry and can significantly lower your auto insurance premiums as a new driver." 
  },
  { 
    q: "Does driving school shorten the wait time for my road test?", 
    a: "In many provinces, absolutely. For example, in Ontario, graduating from an approved Beginner Driver Education (BDE) course reduces the mandatory waiting period for your first road test from 12 months down to just 8 months." 
  },
  { 
    q: "What do I need to bring to my in-car lessons?", 
    a: "You must bring three things: your physical, valid learner's permit (photos are not accepted by law), comfortable closed-toe shoes (no sandals or heavy boots), and corrective lenses/glasses if they are a condition on your licence." 
  }
];

const LandingPage = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false); 
  const [showCareersModal, setShowCareersModal] = useState(false); 
  const [activeFaq, setActiveFaq] = useState(null); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch packages from backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/packages`);
        
        let packagesData = [];
        if (response.data.data) {
          packagesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          packagesData = response.data;
        } else if (response.data.packages) {
          packagesData = response.data.packages;
        } else {
          packagesData = response.data;
        }
        
        setPackages(packagesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(err.response?.data?.message || 'Failed to load packages. Please try again later.');
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const getPackagePrice = (pkg) => {
    const price = pkg.base_amount || pkg.amount;
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice) || numericPrice === 0 || numericPrice === null) return null;
    return numericPrice;
  };

  const renderIncludedItems = (includedItems) => {
    if (!includedItems) return [];
    let items = [];
    if (Array.isArray(includedItems)) {
      items = includedItems;
    } else if (typeof includedItems === 'string') {
      try {
        items = JSON.parse(includedItems);
      } catch (e) {
        items = includedItems.split(',').map(item => item.trim());
      }
    }
    return items;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Contact for Price';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice) || numericPrice === 0) return 'Contact for Price';
    
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice);
  };

  const getFeaturedPackageIndex = () => {
    if (packages.length === 0) return -1;
    const popularIndex = packages.findIndex(p => p.is_popular || p.featured);
    if (popularIndex !== -1) return popularIndex;
    return Math.floor(packages.length / 2);
  };

  const featuredIndex = getFeaturedPackageIndex();

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      
      {/* ==================== NAVBAR ==================== */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 gap-1">
            
            <a 
              href="#"
              onClick={scrollToTop} 
              className="flex items-center gap-1.5 sm:gap-3 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-30 sm:w-70 h-18 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white dark:bg-teal-900/20">
                <img 
                  src="/logo.webp" 
                  alt="Terra Nova Logo" 
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </a>

            <div className="hidden lg:flex items-center gap-6 lg:gap-8">
              <a href="#about" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">About</a>
              <a href="#packages" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">Packages</a>
              <a href="#process" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">How It Works</a>
              <a href="#contact" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">Contact</a>
            </div>

            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <Link 
                to="/login" 
                className="px-2 sm:px-6 py-2 text-[10px] sm:text-sm font-black text-teal-600 dark:text-teal-400 border border-teal-500 rounded-lg sm:rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all"
              >
                Sign In
              </Link>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="px-2 sm:px-6 py-2 text-[10px] sm:text-sm font-black text-white bg-gradient-to-r from-teal-500 to-indigo-600 rounded-lg sm:rounded-xl hover:shadow-xl transition-all"
              >
                Register
              </button>
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1 text-slate-600 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-2 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 dark:text-slate-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition whitespace-nowrap">About</a>
                <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 dark:text-slate-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition whitespace-nowrap">Packages</a>
                <a href="#process" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 dark:text-slate-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition whitespace-nowrap">Steps</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 dark:text-slate-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition whitespace-nowrap">Contact</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            <div className="relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold mb-4">
                <Shield size={12} />
                <span>Canada's #1 Driving School</span>
              </div>
              
              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 leading-tight">
                Learn to Drive with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                  Confidence
                </span>
              </h1>
              
              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto md:mx-0">
                Professional, patient, and safety-focused driving instruction — helping you become a confident driver for life.
              </p>

              <div className="flex flex-col xs:flex-row justify-center md:justify-start gap-3">
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Get Started
                  <ChevronRight size={16} />
                </button>
                <a 
                  href="#packages" 
                  className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center hover:border-teal-500 transition-all"
                >
                  Packages
                </a>
              </div>
            </div>

            <div className="relative hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80" 
                alt="Driving"
                className="relative rounded-[2rem] shadow-2xl object-cover w-full h-[400px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ABOUT SECTION ==================== */}
      <section id="about" className="py-12 sm:py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <span className="text-teal-500 font-black text-[10px] sm:text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-2">
              Newfoundland's Trusted{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                Driving School
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Award size={28} className="sm:w-8 sm:h-8 text-teal-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">Certified Instructors</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                All our instructors are fully licensed and have years of teaching experience.
              </p>
            </div>

            <div className="text-center p-4 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Clock size={28} className="sm:w-8 sm:h-8 text-teal-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">Flexible Scheduling</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Book lessons at times that work best for you, including mornings, afternoons, and evenings.
              </p>
            </div>

            <div className="text-center p-4 sm:p-8 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MapPin size={28} className="sm:w-8 sm:h-8 text-teal-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">Multiple Locations</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Serving Marystown, Burin, St. John's, Mount Pearl, and Grand Falls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STEP BY STEP PROCESS ==================== */}
      <section id="process" className="py-12 sm:py-20 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8 sm:mb-16">
            <span className="text-teal-500 font-black text-[10px] sm:text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-2">
              Get Licensed in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                4 Easy Steps
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { num: 1, title: "Create Account", desc: "Sign up with your basic information and choose your preferred package.", icon: UserCheck, time: "5 minutes" },
              { num: 2, title: "Get Approved", desc: "Our admin team reviews your application and assigns you an instructor.", icon: Clock, time: "24-48 hours" },
              { num: 3, title: "Book Lessons", desc: "Schedule your driving lessons at times that work best for you.", icon: Calendar, time: "Flexible scheduling" },
              { num: 4, title: "Get Licensed", desc: "Complete your training and pass your road test with confidence.", icon: Award, time: "98% success rate" }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[1.5rem] sm:rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
                <div className="relative bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-700 group-hover:border-transparent transition">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-3xl font-black text-teal-500">{step.num}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">{step.desc}</p>
                  <div className="flex items-center gap-2 text-teal-500 text-xs sm:text-sm font-bold">
                    <step.icon size={14} className="sm:w-4 sm:h-4" />
                    <span>{step.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Your Journey Today
              <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== PACKAGES SECTION ==================== */}
      <section id="packages" className="py-12 sm:py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8 sm:mb-16">
            <span className="text-teal-500 font-black text-[10px] sm:text-sm uppercase tracking-wider">Our Packages</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-2">
              Choose Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                Perfect Plan
              </span>
            </h2>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12 sm:py-20">
              <Loader className="animate-spin text-teal-500" size={40} />
              <span className="ml-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">Loading packages...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12 sm:py-20">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && packages.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {packages.map((pkg, index) => {
                const isFeatured = index === featuredIndex;
                const includedItems = renderIncludedItems(pkg.included_items);
                const packagePrice = getPackagePrice(pkg);
                
                // ✨ ADDED: Tier logic based on API data (defaults to Basic if not set)
                const tier = pkg.tier || 'Basic';
                const isPremium = tier === 'Premium';
                
                return (
                  <div 
                    key={pkg.id || index}
                    className={`${isFeatured 
                      ? 'relative bg-gradient-to-br from-teal-500 to-indigo-600 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl scale-100 sm:scale-105 transform' 
                      : 'bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl'} 
                      transition-all duration-300`}
                  >
                    {isFeatured && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-slate-900 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full text-[8px] sm:text-xs font-black uppercase whitespace-nowrap">
                        Most Popular
                      </div>
                    )}
                    
                    {/* ✨ ADDED: Tier Badge paired with the Car Icon */}
                    <div className="flex items-center gap-4 mb-4 sm:mb-6">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 ${isFeatured ? 'bg-white/20' : 'bg-teal-100 dark:bg-teal-900/30'} rounded-2xl flex items-center justify-center`}>
                        <Car size={22} className={`sm:w-6 sm:h-6 ${isFeatured ? 'text-white' : 'text-teal-500'}`} />
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        isPremium 
                          ? (isFeatured ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800')
                          : (isFeatured ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700')
                      }`}>
                        {isPremium && <Sparkles size={12} className={isFeatured ? 'text-amber-300' : 'text-amber-500'} />}
                        {tier} Tier
                      </div>
                    </div>
                    
                    <h3 className={`text-xl sm:text-2xl font-black ${isFeatured ? 'text-white' : 'text-slate-900 dark:text-white'} mb-2`}>
                      {pkg.package_name || pkg.name || 'Driving Package'}
                    </h3>
                    
                    <p className={`text-xs sm:text-sm ${isFeatured ? 'text-white/80' : 'text-slate-500'} mb-3 sm:mb-4`}>
                      {pkg.license_class ? `${pkg.license_class} License` : 'Professional Training'}
                    </p>
                    
                    <div className={`text-2xl sm:text-3xl font-black ${isFeatured ? 'text-white' : 'text-teal-500'} mb-4 sm:mb-6`}>
                      {formatPrice(packagePrice)}
                    </div>
                    
                    <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      {pkg.hours && (
                        <li className="flex items-start gap-2 text-xs sm:text-sm">
                          <CheckCircle size={14} className={`mt-0.5 flex-shrink-0 sm:w-4 sm:h-4 ${isFeatured ? 'text-white' : 'text-teal-500'}`} />
                          <span className={isFeatured ? 'text-white' : ''}>{pkg.hours}+ hours in-car training</span>
                        </li>
                      )}
                      
                      {includedItems.length > 0 ? (
                        includedItems.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                            <CheckCircle size={14} className={`mt-0.5 flex-shrink-0 sm:w-4 sm:h-4 ${isFeatured ? 'text-white' : 'text-teal-500'}`} />
                            <span className={isFeatured ? 'text-white' : ''}>{item}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-2 text-xs sm:text-sm">
                            <CheckCircle size={14} className={`mt-0.5 flex-shrink-0 sm:w-4 sm:h-4 ${isFeatured ? 'text-white' : 'text-teal-500'}`} />
                            <span className={isFeatured ? 'text-white' : ''}>Professional instruction</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs sm:text-sm">
                            <CheckCircle size={14} className={`mt-0.5 flex-shrink-0 sm:w-4 sm:h-4 ${isFeatured ? 'text-white' : 'text-teal-500'}`} />
                            <span className={isFeatured ? 'text-white' : ''}>Modern training vehicles</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs sm:text-sm">
                            <CheckCircle size={14} className={`mt-0.5 flex-shrink-0 sm:w-4 sm:h-4 ${isFeatured ? 'text-white' : 'text-teal-500'}`} />
                            <span className={isFeatured ? 'text-white' : ''}>Certificate of completion</span>
                          </li>
                        </>
                      )}
                    </ul>
                    
                    {pkg.description && (
                      <p className={`text-xs mt-2 ${isFeatured ? 'text-white/70' : 'text-slate-500'}`}>
                        {pkg.description}
                      </p>
                    )}
                    
                    <button 
                      onClick={() => setShowRegisterModal(true)}
                      className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition-all mt-4 ${
                        isFeatured 
                          ? 'bg-white text-teal-600 hover:bg-slate-100' 
                          : 'border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white'
                      }`}
                    >
                      Select Package
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && packages.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-xs sm:text-base text-yellow-600 dark:text-yellow-400">
                  No packages available at the moment. Please check back later.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section id="contact" className="py-12 sm:py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-black/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-8 sm:gap-12 items-center text-center md:text-left">
              
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4 sm:mb-6">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">
                  Get in touch with us today to start your driving education.
                </p>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 text-white">
                    <Phone size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base md:text-lg font-bold">+1 709-749-1564</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 text-white">
                    <Mail size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base md:text-lg font-bold">info@terranovadriverstraining.ca</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 text-white">
                    <MapPin size={16} className="sm:w-5 sm:h-5 shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg font-bold text-left">
                      St. John's, Mount Pearl, Grand Falls, Marystown, Burin
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-right">
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="inline-block bg-white text-teal-600 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg md:text-xl uppercase tracking-wider shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
                >
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            
            {/* BRANDING & SOCIALS */}
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
                  <img src="/logo.webp" alt="Terra Nova" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-base sm:text-xl font-black">Terra Nova</span>
              </div>
              <p className="text-slate-400 text-[10px] sm:text-sm mb-4 leading-relaxed">
                NL MOTOR REGISTRATION APPROVED DRIVER TRAINING SCHOOL.
              </p>
              
              <div className="flex items-center gap-3 mt-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61583376632196" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-teal-500 transition-all" 
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="https://www.instagram.com/terranova_driverstraining/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-teal-500 transition-all" 
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a 
                  href="https://share.google/MKoxAaYuib9EA53q6" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-teal-500 transition-all" 
                  aria-label="Google Reviews"
                >
                  <Star size={16} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="#about" className="text-slate-400 hover:text-white transition text-[10px] sm:text-sm">About Us</a></li>
                <li><a href="#packages" className="text-slate-400 hover:text-white transition text-[10px] sm:text-sm">Packages</a></li>
                <li>
                  <button 
                    onClick={() => setShowCareersModal(true)}
                    className="text-slate-400 hover:text-white transition text-[10px] sm:text-sm"
                  >
                    Careers
                  </button>
                </li>
                <li><a href="#contact" className="text-slate-400 hover:text-white transition text-[10px] sm:text-sm">Contact Us</a></li>
                <li><Link to="/login" className="text-slate-400 hover:text-white transition text-[10px] sm:text-sm">MyTN Account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><Link to="/login" className="text-slate-400 hover:text-white transition text-[10px] sm:text-sm">Student Login</Link></li>
                <li>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="text-slate-400 hover:text-white transition text-[10px] sm:text-sm"
                  >
                    Register
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowFaqModal(true)}
                    className="text-slate-400 hover:text-white transition text-[10px] sm:text-sm"
                  >
                    FAQ / Help
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Hours</h4>
              <ul className="space-y-1 sm:space-y-2 text-slate-400 text-[10px] sm:text-sm">
                <li>Mon-Fri: 8am - 8pm</li>
                <li>Saturday: 9am - 5pm</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-6 sm:mt-12 pt-6 sm:pt-8 text-center text-slate-400 text-[10px] sm:text-sm flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6">
            <p>&copy; {new Date().getFullYear()} Terra Nova Drivers Training.</p>
            <span className="hidden sm:inline text-slate-600">|</span>
            <p>Powered by OpenPath Consulting</p>
          </div>
        </div>
      </footer>

      {/* ==================== REGISTRATION MODAL ==================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl my-auto animate-in fade-in zoom-in duration-300">
            <RegistrationPage 
              onBack={() => setShowRegisterModal(false)} 
              initialData={null}
            />
            <button 
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[110] p-1.5 sm:p-2 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all shadow-xl"
            >
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== FAQ MODAL ==================== */}
      {showFaqModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Canadian Driving Guidelines</p>
              </div>
              <button
                onClick={() => setShowFaqModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950 flex-1">
              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div 
                      key={index} 
                      className={`border ${isOpen ? 'border-teal-500 dark:border-teal-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl overflow-hidden transition-colors duration-200`}
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className={`w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors ${isOpen ? 'bg-teal-50 dark:bg-teal-900/10' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                      >
                        <span className={`text-sm sm:text-base font-bold pr-4 ${isOpen ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {faq.q}
                        </span>
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${isOpen ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 p-4 sm:p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 text-center">
                <p className="text-sm font-bold text-indigo-800 dark:text-indigo-400">Still have questions?</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-1 mb-3">Our support team is ready to help you get on the road.</p>
                <a href="#contact" onClick={() => setShowFaqModal(false)} className="inline-block px-5 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CAREERS MODAL ==================== */}
      {showCareersModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Careers</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Join the Terra Nova Team</p>
              </div>
              <button
                onClick={() => setShowCareersModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950 flex-1">
              
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">Driving Instructor</h2>
                <p className="text-lg font-bold text-teal-600 dark:text-teal-500 mb-4">Terranova Drivers Training</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md">
                    <Briefcase size={14} /> Full-time / Part-time
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md">
                    <MapPin size={14} /> On-site
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md">
                    <Clock size={14} /> Flexible Schedule
                  </span>
                </div>
              </div>

              <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  We’re looking for patient, safety-focused Driving Instructors to provide exceptional in-car training and help students become confident, responsible drivers. If you have a clean record and a passion for teaching, we’d love to meet you.
                </p>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mb-3">Key Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Deliver one-to-one in-car driving lessons following company curriculum and local regulations.</li>
                    <li>Assess student skills and provide clear, constructive feedback after each session.</li>
                    <li>Maintain accurate lesson logs and student progress records.</li>
                    <li>Ensure vehicle safety and cleanliness before every lesson.</li>
                    <li>Communicate professionally with students and parents/guardians as needed.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mb-3">Qualifications</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Valid driver’s licence and a clean driving abstract.</li>
                    <li>Instructor licence/certification (or willingness to obtain, where required).</li>
                    <li>Strong communication, patience, and professionalism.</li>
                    <li>Availability for evenings and/or weekends.</li>
                    <li>Background check may be required.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mb-3">What We Offer</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Competitive compensation with performance incentives.</li>
                    <li>Flexible scheduling options.</li>
                    <li>Supportive team and standardized training materials.</li>
                    <li>Opportunities for growth and additional certifications.</li>
                  </ul>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-black text-slate-900 dark:text-white mb-2">Details</h4>
                  <p><strong>Employment Type:</strong> Full-time / Part-time</p>
                  <p><strong>Start Date:</strong> ASAP</p>
                  <p><strong>Location:</strong> Local service area</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 flex flex-col items-center justify-center gap-3">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 text-center">
                Ready to help new drivers succeed? Send your resume to:
              </p>
              <a 
                href="mailto:info@terranovadriverstraining.ca?subject=Application for Driving Instructor"
                className="w-full sm:w-auto px-8 py-3 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-sm font-black tracking-wider rounded-xl border-2 border-teal-500 hover:bg-teal-500 hover:text-white transition-all text-center flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                info@terranovadriverstraining.ca
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

export default LandingPage;