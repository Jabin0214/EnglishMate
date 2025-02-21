import { useState, useEffect, useRef } from "react";

// 📌 解析字幕，将单词和标点符号分开
const splitText = (text) => {
  const words = [];
  const punctuations = [];
  
    const regex = /(\b\w+(?:'\w+)?\b|[.,!?;])/g;
    const matches = text.match(regex) || [];

  matches.forEach((match, index) => {
    if (/\b\w+\b/.test(match)) {
      words.push(match); // 这是单词
      punctuations.push(null); // 对应的位置上没有标点
    } else {
      if (punctuations.length > 0) {
        punctuations[punctuations.length - 1] = match; // 把标点放到前一个单词的后面
      }
    }
  });

  return { words, punctuations };
};

export default function TypingPractice({ text }) {
  if (!text || typeof text !== "string" || text.trim() === "") return null;

  const { words, punctuations } = splitText(text);
  const [inputWords, setInputWords] = useState(Array(words.length).fill(""));

  const inputRefs = useRef([]);
  useEffect(() => {
    setInputWords(Array(words.length).fill("")); // ✅ 确保输入框与单词长度匹配
  }, [text]);

  const handleChange = (index, value) => {
    const newInputWords = [...inputWords];
    newInputWords[index] = value;
    setInputWords(newInputWords);

    // 自动跳到下一个输入框
    if (value.length === words[index].length && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const isCorrect = (index) => {
    if (!inputWords[index] || !words[index]) return false;
    return inputWords[index].toLowerCase() === words[index].toLowerCase();
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-2xl shadow-md w-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Type the subtitle:</h2>
      <p className="text-xl font-mono bg-gray-200 p-4 rounded-md text-center">{text}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {words.map((word, index) => (
          <div key={index} className="flex items-center">
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={inputWords[index] || ""}
              onChange={(e) => handleChange(index, e.target.value)}
              className={`p-2 text-center border-b-4 focus:outline-none transition-all duration-200 ${
                isCorrect(index) ? "border-green-500 bg-green-100" : "border-gray-300"
              }`}
              maxLength={word.length}
              style={{ width: `${word.length + 2}ch` }}
            />
            {punctuations[index] && <span className="text-xl">{punctuations[index]}</span>}
          </div>
        ))}
      </div>
      {inputWords.join(" ") === words.join(" ") && <p className="text-green-600 mt-2">✅ Well done!</p>}
    </div>
  );
}