// components/ChatBot.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function ChatBot() {
  const [messages, setMessages] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem("symptomChat");
    return saved ? JSON.parse(saved) : [
      { role: "bot", content: "👋 Hi! I’m your AI symptom checker. How can I help you today?" }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");

  // Save chat to localStorage on updates
  useEffect(() => {
    localStorage.setItem("symptomChat", JSON.stringify(messages));
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/chatbot/chat", {
        message: input,
        lang,
      });

      const reply = { role: "bot", content: res.data.reply };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const errorMsg = {
        role: "bot",
        content: "⚠️ Chatbot unavailable. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md h-[calc(100vh-4rem)] fixed right-4 top-4 flex flex-col bg-white shadow-xl rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="border-b p-4 font-semibold text-lg bg-gray-50 rounded-t-2xl">
        🩺 Symptom Checker
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-3 rounded-2xl shadow-sm max-w-[80%] text-sm leading-relaxed ${msg.role === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 text-gray-900"
              }`}
          >
            {msg.content}
          </motion.div>
        ))}

        {loading && (
          <div className="mr-auto bg-gray-200 text-gray-600 p-3 rounded-2xl text-sm">
            Typing...
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="p-3 border-t flex items-center gap-2 bg-white rounded-b-2xl">
        <input
          type="text"
          placeholder="Describe your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}









// Chatbot.jsx
// import React, { useEffect } from "react";

// export default function Chatbot() {
//   useEffect(() => {
//     // Load the script dynamically
//     const script = document.createElement("script");
//     script.src="https://dashboard.retellai.com/retell-widget.js";
//     script.async = true;
//     script.onload = () => {
//       if (window.RetellAI) {
//         window.RetellAI.init({
//           agentId: "agent_ecee1b6cf9352b7a0b6e062255",  // Replace with your agent ID
//           type: "voice",             // or "chat"
//           style: {
//             position: "bottom-right",
//             theme: "light",
//             buttonColor: "#3B82F6",
//           },
//         });
//       }
//     };
//     document.body.appendChild(script);

//     // cleanup when component unmounts
//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   return null; // The widget renders itself, no UI needed here
// }
