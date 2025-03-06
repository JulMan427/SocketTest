import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "./socket";

const Voting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room } = location.state;
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  useEffect(() => {
    socket.on("show_ai_story", ({ winner, aiStory }) => {
      console.log("✅ Received show_ai_story event, navigating to AIStory.js");
      navigate("/ai-story", { state: { room, winner, aiStory } });
    });

    return () => {
      socket.off("show_ai_story");
    };
  }, [navigate, room]);

  const submitVote = () => {
    if (selectedPrompt !== null && !voteSubmitted) {
      console.log(`🔵 Submitting vote for: ${selectedPrompt}`);
      socket.emit("submit_vote", { room, votedPrompt: selectedPrompt });
      setVoteSubmitted(true);
    }
  };

  return (
    <div>
      <h2>Vote for the Best Submission</h2>
      {location.state.prompts.map((entry, index) => (
        <button
          key={index}
          onClick={() => setSelectedPrompt(entry.prompt)}
          disabled={voteSubmitted}
        >
          {entry.prompt}
        </button>
      ))}
      <button onClick={submitVote} disabled={selectedPrompt === null || voteSubmitted}>
        Submit Vote
      </button>
    </div>
  );
};

export default Voting;
