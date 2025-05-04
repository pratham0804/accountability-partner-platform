import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <h1>Find Your Accountability Partner</h1>
        <p>
          Connect with like-minded individuals, set goals together, and stay
          motivated with financial stakes.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-reverse">
            Login
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Match by Interests</h3>
          <p>Find partners with similar goals and interests</p>
        </div>
        <div className="feature-card">
          <h3>Financial Stakes</h3>
          <p>Stay motivated with financial accountability</p>
        </div>
        <div className="feature-card">
          <h3>Track Progress</h3>
          <p>Monitor your goals and celebrate achievements</p>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up and set up your profile with interests and skills</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Find a Partner</h3>
            <p>Browse potential matches and connect with partners</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Set Goals Together</h3>
            <p>Create agreements with tasks and financial stakes</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Achieve Results</h3>
            <p>Complete tasks, verify progress, and earn rewards</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 