import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function EnterName() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (name.trim() !== "") {
      localStorage.setItem("userName", name); // Store name in localStorage
      navigate("/enter-room"); // s
    }
  };

  return (
    <div>
      <h2>Enter Your Name</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleNext}>Next</button>
    </div>
  );
}

export default EnterName;
