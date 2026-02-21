import React from "react";

/**
 * FunFact component — displays an animal's fun fact on the album page.
 * Props:
 *   animal – animal data object { name, emoji, fact, color }
 */
function FunFact({ animal }) {
  if (!animal) return null;

  return (
    <div className="fun-fact" style={{ borderColor: animal.color }}>
      <span className="fun-fact-emoji">{animal.emoji}</span>
      <div className="fun-fact-content">
        <h4 className="fun-fact-title">Did you know?</h4>
        <p className="fun-fact-text">{animal.fact}</p>
        <span className="fun-fact-name">— {animal.name}</span>
      </div>
    </div>
  );
}

export default FunFact;
