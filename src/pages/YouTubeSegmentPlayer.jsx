import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { getSubtitles } from "../api";
import TypingPractice from "./TypingPractice";

export default function YouTubeSegmentPlayer() {
  const [videoId, setVideoId] = useState(""); // YouTube video ID
  const [subtitles, setSubtitles] = useState([]); // Subtitles list
  const [currentCaption, setCurrentCaption] = useState(""); // Current caption
  const [currentIndex, setCurrentIndex] = useState(-1); // Current caption index
  const [isPlaying, setIsPlaying] = useState(false); // Control playback state
  const [showSubtitle, setShowSubtitle] = useState(true); // Control subtitle visibility
  
  const playerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (videoId) {
      getSubtitles(videoId).then((data) => {
        setSubtitles(data);
        setCurrentIndex(-1);
        setCurrentCaption("");
        setIsPlaying(false);
      });
    }
    
    // Cleanup function for timeouts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isPlaying && currentIndex !== -1 && playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime() * 1000;
      const subtitle = subtitles[currentIndex];
      const remainingTime = (subtitle.offset + subtitle.duration) - currentTime;
      
      if (remainingTime > 0) {
        timeoutRef.current = setTimeout(() => {
          setIsPlaying(false);
          const newCurrentTime = playerRef.current?.getCurrentTime() * 1000;
          if (newCurrentTime >= subtitle.offset + subtitle.duration) {
            setIsPlaying(false);
          }
        }, remainingTime);
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentIndex, subtitles]);

  const handleProgress = (state) => {
    if (!isPlaying || subtitles.length === 0) return;
    
    const currentTime = state.playedSeconds * 1000; // Convert to milliseconds
    
    const newIndex = subtitles.findIndex(
      (sub) => currentTime >= sub.offset && currentTime < sub.offset + sub.duration
    );
    
    // If we've entered a new subtitle segment
    if (newIndex !== -1 && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      setCurrentCaption(subtitles[newIndex].text);
      
      // Reset the timeout for the new subtitle
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      const subtitle = subtitles[newIndex];
      const remainingTime = (subtitle.offset + subtitle.duration) - currentTime;
      
      if (remainingTime > 0) {
        timeoutRef.current = setTimeout(() => {
          setIsPlaying(false);
        }, remainingTime);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < subtitles.length - 1) {
      jumpToSubtitle(currentIndex + 1);
    }
  };

  const handleRepeat = () => {
    if (currentIndex !== -1) {
      jumpToSubtitle(currentIndex);
    }
  };

  const toggleSubtitle = () => {
    setShowSubtitle(!showSubtitle);
  };

  const jumpToSubtitle = (index) => {
    if (index < 0 || index >= subtitles.length || !playerRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const subtitle = subtitles[index];
    playerRef.current.seekTo(subtitle.offset / 1000); // Jump to subtitle start time
    setCurrentCaption(subtitle.text);
    setCurrentIndex(index);
    setIsPlaying(true); // Resume playback
    
    const duration = subtitle.duration;
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, duration);
    }
  };

  const handlePlay = () => {
    if (currentIndex === -1 && subtitles.length > 0) {
      jumpToSubtitle(0);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayerReady = () => {
    if (videoId && subtitles.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
      setCurrentCaption(subtitles[0].text);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">YouTube Listening Practice</h2>
        <input
          type="text"
          className="border p-2 mb-2 rounded-md w-full"
          placeholder="Enter YouTube Video ID"
          value={videoId}
          onChange={(e) => {
            setVideoId(e.target.value);
            setSubtitles([]);
            setCurrentCaption("");
            setCurrentIndex(-1);
            setIsPlaying(false);
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
        />
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          playing={isPlaying}
          controls={true}
          width="100%"
          height="400px"
          onProgress={handleProgress}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onReady={handlePlayerReady}
        />
        <div className="flex flex-wrap gap-2 mt-4">
          <button 
            onClick={handlePlay} 
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button 
            onClick={handleNext} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={currentIndex >= subtitles.length - 1}
          >
            Next Sentence
          </button>
          <button 
            onClick={handleRepeat} 
            className="px-4 py-2 bg-purple-500 text-white rounded"
            disabled={currentIndex === -1}
          >
            Repeat Sentence
          </button>
          <button 
            onClick={toggleSubtitle} 
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            {showSubtitle ? "Hide Subtitle" : "Show Subtitle"}
          </button>
        </div>
        {currentCaption && showSubtitle && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <p className="text-lg text-center">{currentCaption}</p>
          </div>
        )}
        {currentCaption && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Practice Typing:</h3>
            <TypingPractice text={currentCaption} />
          </div>
        )}
      </div>
    </div>
  );
}