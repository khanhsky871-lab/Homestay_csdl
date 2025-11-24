import React from "react";
import "./Home.css";
import HomeSlider from './HomeSlider';

const Home = () => {
  return (
    <div>
      <div className="hero">
        <div className="hero-overlay">
          <h1>Entire place, just for you</h1>
        </div>
      </div>
      <div className="home">
        <div className="slider-section">
          <h2>Find spaces that suit your style</h2>
          <HomeSlider />
        </div>
      </div>
    </div>
  );
};

export default Home;
