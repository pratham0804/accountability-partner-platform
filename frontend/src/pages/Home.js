import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      {/* Hero Section with Enhanced Visuals */}
      <section className="hero px-4 py-24 md:py-40 flex flex-col items-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-100 rounded-full opacity-30 blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto z-10"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-500 text-transparent bg-clip-text mb-8 leading-tight">
            Find Your Accountability Partner
          </h1>
          <p className="text-xl md:text-2xl text-neutral-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with like-minded individuals, set goals together, and stay
            motivated with financial stakes.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="shadow-lg"
            >
              <Link to="/register" className="inline-block px-10 py-5 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" className="inline-block px-10 py-5 rounded-full bg-white text-primary-600 font-semibold text-lg border-2 border-primary-500 shadow-md hover:shadow-xl transition-all duration-300">
                Login
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section with Card Enhancements */}
      <section className="features px-6 py-24 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-800 mb-4">Amazing Features</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">Everything you need to stay accountable and achieve your goals</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-6"></div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          <motion.div 
            whileHover={{ y: -12, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            className="feature-card bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-8 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-600" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-4 text-center">Match by Interests</h3>
            <p className="text-neutral-600 text-center text-lg">Find partners with similar goals and interests for better accountability</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -12, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            className="feature-card bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-8 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-600" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-4 text-center">Financial Stakes</h3>
            <p className="text-neutral-600 text-center text-lg">Stay motivated with real financial accountability and incentives</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -12, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            className="feature-card bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-100"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-8 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-600" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-4 text-center">Track Progress</h3>
            <p className="text-neutral-600 text-center text-lg">Monitor your goals and celebrate achievements with detailed tracking</p>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section with Enhanced Steps */}
      <section className="how-it-works px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-800 mb-4">How It Works</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">Our simple 4-step process to transform your goals into achievements</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto mt-6"></div>
        </motion.div>
        
        <div className="steps grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
          <div className="hidden lg:block absolute h-2 bg-primary-200 top-[5.5rem] left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] z-0"></div>
          
          {[
            {
              number: 1,
              title: "Create an Account",
              description: "Sign up and set up your profile with your interests, goals, and skills"
            },
            {
              number: 2,
              title: "Find a Partner",
              description: "Browse potential matches and connect with accountability partners"
            },
            {
              number: 3,
              title: "Set Goals Together",
              description: "Create agreements with specific tasks and financial stakes"
            },
            {
              number: 4,
              title: "Achieve Results",
              description: "Complete tasks, verify progress, and earn rewards together"
            }
          ].map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * index }}
              viewport={{ once: true, margin: "-100px" }}
              className="step bg-white p-10 rounded-2xl shadow-xl z-10 text-center border border-neutral-100"
            >
              <div className="step-number w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-full flex justify-center items-center font-bold text-xl mx-auto mb-6 z-20 shadow-lg">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-4">{step.title}</h3>
              <p className="text-neutral-600 text-lg">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* CTA Section with Enhanced Design */}
      <section className="cta px-6 py-24 md:py-32 bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto z-10 relative"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Ready to Reach Your Goals?</h2>
          <p className="text-xl md:text-2xl mb-12 text-primary-100 max-w-3xl mx-auto">Join our community today and find the perfect accountability partner to transform your aspirations into achievements.</p>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link to="/register" className="inline-block px-10 py-5 rounded-full bg-white text-primary-700 font-semibold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
              Get Started Now
            </Link>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Footer Section */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">Accountability Partner Platform</h3>
            <p className="mb-6">Connect, commit, and achieve your goals together.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-800 text-center">
          <p>&copy; {new Date().getFullYear()} Accountability Partner Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 