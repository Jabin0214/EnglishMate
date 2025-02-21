import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TypingPractice from "./pages/TypingPractice";
import Home from "./pages/Home";
import YouTubeSegmentPlayer from "./pages/YouTubeSegmentPlayer.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/typing-practice" element={<TypingPractice />} />
        <Route path="/youtube-segment-player" element={<YouTubeSegmentPlayer />} />
      </Routes>
    </Router>
  );
}
