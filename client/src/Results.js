import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { winner } = location.state;

  return (
    <div>
      <h2>Game Over!</h2>
      <h3>Winner: {winner}</h3>
      <button onClick={() => navigate("/")}>Play Again</button>
    </div>
  );
};

export default Results;
