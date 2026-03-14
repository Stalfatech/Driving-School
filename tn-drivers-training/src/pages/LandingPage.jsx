
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Shield, Award, Users, Clock, MapPin, 
  ChevronRight, Star, Phone, Mail, CheckCircle,
  BookOpen, CreditCard, Calendar, UserCheck,
  Menu, X
} from 'lucide-react';
import RegisterModal from '../components/RegisterModal';

const LandingPage = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      
      {/* ==================== NAVBAR ==================== */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Car size={28} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  Terra<span className="text-teal-500">Driving</span>
                </h1>
                <p className="text-[10px] font-bold text-teal-500 uppercase tracking-wider">
                  School of Excellence
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">About</a>
              <a href="#packages" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">Packages</a>
              <a href="#process" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">How It Works</a>
              <a href="#testimonials" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">Testimonials</a>
              <a href="#contact" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition">Contact</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="hidden sm:block px-6 py-3 text-sm font-black text-teal-600 dark:text-teal-400 border-2 border-teal-500 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all"
              >
                Sign In
              </Link>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                Register Now
              </button>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col space-y-3">
                <a href="#about" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition px-2 py-2">About</a>
                <a href="#packages" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition px-2 py-2">Packages</a>
                <a href="#process" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition px-2 py-2">How It Works</a>
                <a href="#testimonials" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition px-2 py-2">Testimonials</a>
                <a href="#contact" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-500 transition px-2 py-2">Contact</a>
                <Link to="/login" className="text-sm font-bold text-teal-600 border-t border-slate-200 pt-3 px-2">Sign In</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Shield size={16} />
                <span>Canada's #1 Driving School</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">
                Learn to Drive with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                  Confidence
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                Join thousands of successful drivers who trusted TerraDriving for their journey to becoming safe, confident, and licensed drivers.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="group bg-gradient-to-r from-teal-500 to-indigo-600 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  Get Started Today
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition" />
                </button>
                <a 
                  href="#packages" 
                  className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wider hover:border-teal-500 transition-all"
                >
                  View Packages
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12">
                <div>
                  <p className="text-3xl font-black text-teal-500">10K+</p>
                  <p className="text-sm font-bold text-slate-500">Happy Students</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-teal-500">50+</p>
                  <p className="text-sm font-bold text-slate-500">Expert Instructors</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-teal-500">98%</p>
                  <p className="text-sm font-bold text-slate-500">Pass Rate</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative hidden md:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[3rem] blur-2xl opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Driving instructor with student"
                className="relative rounded-[2rem] shadow-2xl object-cover w-full h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ABOUT SECTION ==================== */}
      <section id="about" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-500 font-black text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-2">
              Canada's Most Trusted{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                Driving School
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award size={32} className="text-teal-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Certified Instructors</h3>
              <p className="text-slate-600 dark:text-slate-400">
                All our instructors are fully licensed and have years of teaching experience.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock size={32} className="text-teal-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Flexible Scheduling</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Book lessons at times that work best for you, including evenings and weekends.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} className="text-teal-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Multiple Locations</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Convenient locations across Canada with modern training vehicles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STEP BY STEP PROCESS ==================== */}
      <section id="process" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-teal-500 font-black text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-2">
              Get Licensed in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                4 Easy Steps
              </span>
            </h2>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 group-hover:border-transparent transition">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-black text-teal-500">1</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Create Account</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Sign up with your basic information and choose your preferred package.
                </p>
                <div className="flex items-center gap-2 text-teal-500 text-sm font-bold">
                  <UserCheck size={16} />
                  <span>5 minutes</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 group-hover:border-transparent transition">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-black text-teal-500">2</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Get Approved</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Our admin team reviews your application and assigns you an instructor.
                </p>
                <div className="flex items-center gap-2 text-teal-500 text-sm font-bold">
                  <Clock size={16} />
                  <span>24-48 hours</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 group-hover:border-transparent transition">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-black text-teal-500">3</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Book Lessons</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Schedule your driving lessons at times that work best for you.
                </p>
                <div className="flex items-center gap-2 text-teal-500 text-sm font-bold">
                  <Calendar size={16} />
                  <span>Flexible scheduling</span>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 group-hover:border-transparent transition">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl font-black text-teal-500">4</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Get Licensed</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Complete your training and pass your road test with confidence.
                </p>
                <div className="flex items-center gap-2 text-teal-500 text-sm font-bold">
                  <Award size={16} />
                  <span>98% success rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Your Journey Today
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== PACKAGES SECTION ==================== */}
      <section id="packages" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-teal-500 font-black text-sm uppercase tracking-wider">Our Packages</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-2">
              Choose Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                Perfect Plan
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Package 1 - Beginner */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Car size={24} className="text-teal-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Beginner Package</h3>
              <p className="text-sm text-slate-500 mb-4">Perfect for first-time drivers</p>
              <div className="text-3xl font-black text-teal-500 mb-6">$450</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-teal-500" />
                  <span>10 hours in-car training</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-teal-500" />
                  <span>Classroom sessions</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-teal-500" />
                  <span>Practice test materials</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-3 border-2 border-teal-500 text-teal-500 rounded-xl font-black text-sm hover:bg-teal-500 hover:text-white transition"
              >
                Select Package
              </button>
            </div>

            {/* Package 2 - Standard (Featured) */}
            <div className="relative bg-gradient-to-br from-teal-500 to-indigo-600 rounded-[2rem] p-8 shadow-2xl scale-105 transform">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-xs font-black uppercase">
                Most Popular
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Award size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Standard Package</h3>
              <p className="text-sm text-white/80 mb-4">Best value for most students</p>
              <div className="text-3xl font-black text-white mb-6">$650</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle size={16} className="text-white" />
                  <span>15 hours in-car training</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle size={16} className="text-white" />
                  <span>All classroom materials</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle size={16} className="text-white" />
                  <span>1 mock road test</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-3 bg-white text-teal-600 rounded-xl font-black text-sm hover:bg-slate-100 transition"
              >
                Select Package
              </button>
            </div>

            {/* Package 3 - Premium */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={24} className="text-teal-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Premium Package</h3>
              <p className="text-sm text-slate-500 mb-4">Maximum preparation</p>
              <div className="text-3xl font-black text-teal-500 mb-6">$850</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-teal-500" />
                  <span>20 hours in-car training</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-teal-500" />
                  <span>Premium study materials</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-teal-500" />
                  <span>2 mock road tests</span>
                </li>
              </ul>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-3 border-2 border-teal-500 text-teal-500 rounded-xl font-black text-sm hover:bg-teal-500 hover:text-white transition"
              >
                Select Package
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-teal-500 font-black text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-2">
              What Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">
                Students Say
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  "The instructors at TerraDriving were amazing! I passed my G2 test on the first try. The online portal made scheduling so easy."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-black">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">Sarah Johnson</p>
                    <p className="text-xs text-slate-500">G2 Licensed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section id="contact" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[3rem] p-12 relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Join thousands of successful drivers who chose TerraDriving for their training.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white">
                    <Phone size={20} />
                    <span className="text-lg font-bold">1-800-TERRA-DRIVE</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Mail size={20} />
                    <span className="text-lg font-bold">info@terradriving.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <MapPin size={20} />
                    <span className="text-lg font-bold">Multiple locations across Canada</span>
                  </div>
                </div>
              </div>

              {/* Right CTA */}
              <div className="text-center md:text-right">
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="inline-block bg-white text-teal-600 px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-wider shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
                >
                  Register Now
                </button>
                <p className="text-white/80 mt-4 text-sm">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* Logo */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Car size={20} className="text-white" />
                </div>
                <span className="text-xl font-black">TerraDriving</span>
              </div>
              <p className="text-slate-400 text-sm">
                Canada's most trusted driving school since 2010.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-black text-sm uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-slate-400 hover:text-white transition">About Us</a></li>
                <li><a href="#packages" className="text-slate-400 hover:text-white transition">Packages</a></li>
                <li><a href="#process" className="text-slate-400 hover:text-white transition">How It Works</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-black text-sm uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-slate-400 hover:text-white transition">Student Login</Link></li>
                <li><Link to="/login" className="text-slate-400 hover:text-white transition">Instructor Login</Link></li>
                <li>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    Register
                  </button>
                </li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-black text-sm uppercase tracking-wider mb-4">Hours</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Mon-Fri: 8am - 8pm</li>
                <li>Saturday: 9am - 5pm</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} TerraDriving School. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)} 
          onLoginClick={() => {
            setShowRegisterModal(false);
            // You can handle login modal here if needed
          }}
        />
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
`}</style>
    </div>
  );
};

export default LandingPage;