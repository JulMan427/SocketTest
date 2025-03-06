import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "./socket";

const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, room } = location.state;
  const [countdown, setCountdown] = useState(5);
  const [prompt, setPrompt] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setCanSubmit(true);
        }
        return prev - 1;
      });
    }, 1000);

    socket.on("prompts_ready", (data) => {
      navigate("/voting", { state: { name, room, prompts: data } });
    });

    return () => {
      clearInterval(timer);
      socket.off("prompts_ready");
    };
  }, [navigate, name, room]);

  const submitPrompt = () => {
    if (!prompt.trim() || submitted) {
      return; // Prevent submitting an empty or duplicate prompt
    }
    socket.emit("submit_prompt", { room, prompt });
    setSubmitted(true);
  };

  return (
    <div>
      <h2>Game in Progress</h2>
      {!canSubmit ? (
        <h3>Starting in {countdown}...</h3>
      ) : (
        <>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here..."
          />
          <button onClick={submitPrompt} disabled={!prompt.trim() || submitted}>
            Submit
          </button>
        </>
      )}
    </div>
  );
};

export default Game;
