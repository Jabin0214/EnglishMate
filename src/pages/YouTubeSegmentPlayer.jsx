import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { getSubtitles } from "../api";
import TypingPractice from "./TypingPractice";

export default function YouTubeSegmentPlayer() {
  const [videoId, setVideoId] = useState(""); // YouTube 视频 ID
  const [subtitles, setSubtitles] = useState([]); // 字幕列表
  const [currentCaption, setCurrentCaption] = useState(""); // 当前字幕
  const playerRef = useRef(null);

  // 📌 加载字幕
  useEffect(() => {
    if (videoId) {
      getSubtitles(videoId).then((data) => {
        setSubtitles(data);
      });
    }
  }, [videoId]);

  //  监听 `onProgress`，自动更新字幕
  const handleProgress = (state) => {
    const currentTime = state.playedSeconds * 1000; // 秒转毫秒
    const currentSub = subtitles.find(
      (sub) => currentTime >= sub.offset && currentTime <= sub.offset + sub.duration
    );
    setCurrentCaption(currentSub ? currentSub.text : "");
  };

  const handlePrevious = () => {
    if (!playerRef.current || subtitles.length === 0) return;

    const currentTime = playerRef.current.getCurrentTime() * 1000; // 获取当前播放时间（秒转毫秒）

    // 找到当前字幕
    const currentIndex = subtitles.findIndex(
      (sub) => currentTime >= sub.offset && currentTime <= sub.offset + sub.duration
    );

    // 如果已经是第一个字幕，则不跳转
    if (currentIndex <= 0) return;

    // 获取上一个字幕
    const previousSub = subtitles[currentIndex - 1];

    // 跳转到上一个字幕的起始时间
    playerRef.current.seekTo(previousSub.offset / 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">YouTube Subtitle Player</h2>

        {/* 输入 YouTube 视频 ID */}
        <input
          type="text"
          className="border p-2 mb-2 rounded-md w-full"
          placeholder="Enter YouTube Video ID"
          onChange={(e) => {
            setVideoId(e.target.value);
            setSubtitles([]);
            setCurrentCaption("");
          }}
        />

        {/* 播放器 */}
        <ReactPlayer
          ref={playerRef}
          url={videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""}
          playing={true}
          controls={true}
          width="100%"
          height="400px"
          onProgress={handleProgress}
        />
        <button
          onClick={handlePrevious}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Previous Subtitle
        </button>
        {/* 练习打字 */}
        {currentCaption && typeof currentCaption === "string" && currentCaption.trim() !== "" && (
          <TypingPractice text={currentCaption} />
        )}
      </div>
    </div>
  );
}