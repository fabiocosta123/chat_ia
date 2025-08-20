import { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaCopy,
  FaEraser,
  FaMoon,
  FaSun,
  FaDownload,
  FaMicrophone,
  FaUpload,
  FaVolumeUp,
  FaPause,
} from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../styles/chat.css";
import MagoLogo from "../assets/img/magoSemFundo.png";

import jsPDF from "jspdf";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const ChatApp = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Salva histórico
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // Reconhecimento de voz
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
        toast.success("Texto capturado por voz!");
      };

      recognition.onerror = () => {
        toast.error("Erro ao capturar voz.");
        setListening(false);
      };

      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (listening) return toast.info("Já estou escutando...");
    recognitionRef.current?.start() ??
      toast.error("Reconhecimento não suportado.");
    setListening(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return toast.error("O campo está vazio!");

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();
      const botMessage = { role: "assistant", content: text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Erro Gemini:", error);
      toast.error("Erro ao buscar resposta!");
    } finally {
      setLoading(false);
      setInput("");
      setListening(false);
    }
  };

  const speakMessage = (text) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
    toast.info("Lendo resposta em voz...");
  };

  const pauseAudio = () => {
    speechSynthesis.pause();
    toast.info("Áudio pausado.");
  };

  const downloadMessage = (text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resposta.txt";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Resposta baixada!");
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Resposta copiada!");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.info(`Arquivo "${file.name}" carregado.`);

    if (file.type.startsWith("text/") || file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        setInput(content.slice(0, 1000));
        toast.success("Texto do arquivo carregado no campo.");
      };
      reader.readAsText(file);
    } else {
      toast.error("Tipo de arquivo não suportado.");
    }
  };

  const clearInput = () => {
    setInput("");
    toast.info("Campo de texto limpo!");
  };

  const exportHistoryAsPDF = () => {
    if (messages.length === 0) {
      toast.info("Nenhuma mensagem para exportar.");
      return;
    }

    const doc = new jsPDF();
    let y = 10;

    messages.forEach((msg, index) => {
      const prefix = msg.role === "user" ? "Você: " : "Copilot: ";
      const lines = doc.splitTextToSize(prefix + msg.content, 180);

      lines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10, y);
        y += 7;
      });

      y += 5;
    });

    doc.save("historico_chat.pdf");
    toast.success("PDF exportado com sucesso!");
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <div className={`chat-container ${darkMode ? "dark" : ""}`}>
      <ToastContainer />
      <div className="header">
        <div className="logo-title">
          <img src={MagoLogo} alt="Logo Mago" className="logo-img" />
          <h1>Dr. Botica responde</h1>
        </div>
        <button onClick={toggleTheme} className="btn-dark">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === "user" ? "🧑" : "🤖"}</div>
            <div className="text">
              {msg.content}
              {msg.role === "assistant" && (
                <div className="msg-actions">
                  <button onClick={() => speakMessage(msg.content)}>
                    <FaVolumeUp />
                  </button>
                  <button onClick={pauseAudio}>
                    <FaPause />
                  </button>
                  <button onClick={() => downloadMessage(msg.content)}>
                    <FaDownload />
                  </button>
                  <button onClick={() => copyMessage(msg.content)}>
                    <FaCopy />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="thinking">🤔 Pensando...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="controls">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem ou use voz/upload..."
        />
        <button onClick={sendMessage}>
          <FaPaperPlane />
        </button>
        <button onClick={startListening}>
          <FaMicrophone />
        </button>
        <button onClick={clearInput}>
          <FaEraser />
        </button>
        <label className="upload-btn">
          <FaUpload />
          <input type="file" onChange={handleFileUpload} hidden />
        </label>
        <button onClick={exportHistoryAsPDF}>
          <FaDownload />
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
