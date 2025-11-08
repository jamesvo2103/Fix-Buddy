import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function Home({ user }) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-linear-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Fix Your Items with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get instant repair solutions, DIY guides, and find nearby professionals
              using our AI-powered diagnosis system.
            </p>
            {user ? (
              <Link
                to="/diagnosis"
                className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-8 rounded-lg transition inline-block"
              >
                Start Diagnosis →
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-8 rounded-lg transition inline-block"
              >
                Get Started →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📸', title: 'Upload or Describe', desc: 'Share a photo or details about your item' },
              { icon: '🤖', title: 'AI Diagnosis', desc: 'Our AI analyzes and identifies the problem' },
              { icon: '🔧', title: 'Get Solutions', desc: 'Receive DIY steps, parts list, and professional help nearby' }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow text-center">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose Fix Buddy?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: '⭐', title: 'Expert AI', desc: 'Powered by Google Gemini for accurate diagnosis' },
              { icon: '💰', title: 'Save Money', desc: 'Learn DIY repairs and avoid expensive technician fees' },
              { icon: '🗺️', title: 'Find Repairs', desc: 'Locate professional services nearby if needed' },
              { icon: '📺', title: 'Video Guides', desc: 'Watch YouTube tutorials for step-by-step help' }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="text-4xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Fix Your Item?</h2>
          <p className="text-xl text-blue-100 mb-8">Get instant AI-powered repair solutions.</p>
          {user ? (
            <Link
              to="/diagnosis"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition inline-block"
            >
              Start Now →
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition inline-block"
            >
              Login or Sign Up →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

Home.propTypes = {
  user: PropTypes.object
};