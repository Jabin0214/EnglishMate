import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5209/api/youtube";

/**
 * 获取字幕
 * @param {string} videoId - YouTube 视频 ID
 * @returns {Promise<Array>} - 返回字幕 JSON 数组
 */
export const getSubtitles = async (videoId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/captions`, {
      params: { videoId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    return [];
  }
};