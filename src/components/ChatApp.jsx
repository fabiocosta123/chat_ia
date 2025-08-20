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
  FaVolumeUp
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/chat.css";
import MagoLogo from '../assets/img/magoSemFundo.png'
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

  //Configuração da voz
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

      recognition.onend = () => {       
        setListening(false);
      }

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
  if (listening) {
    toast.info("Já estou escutando...");
    return;
  }

  if (recognitionRef.current) {
    recognitionRef.current.start();
    setListening(true);
  } else {
    toast.error("Reconhecimento de voz não suportado.");
  }
  };


  const sendMessage = async () => {
    if (!input.trim()) {
      toast.error("O campo está vazio!");
      return;
    }

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
 
  // copia resposta
  const copyLastMessage = () => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      navigator.clipboard.writeText(last.content);
      toast.success("Resposta copiada!");
    } else {
      toast.info("Nada para copiar ainda!");
    }
  };
 

  // limpa campo de input
  const clearInput = () => {
    setInput("");
    toast.info("Campo de texto limpo!");
  };
  

  // exporta conversa
  const exportHistory = () => {
    if (messages.length === 0) {
      toast.info("Nenhuma mensagem para exportar.");
      return;
    }

    const content = messages
      .map((msg) => `${msg.role === "user" ? "Você" : "Copilot"}: ${msg.content}`)
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "historico_chat.txt";
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Histórico exportado!");
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // Upload de arquivos
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.info(`Arquivo "${file.name}" carregado.`);

    if (file.type.startsWith("text/") || file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async () => {
        const content = reader.result;
        setInput(content.slice(0, 1000)); // limita para evitar excesso
        toast.success("Texto do arquivo carregado no campo.");
      };
      reader.readAsText(file);
    } else {
      toast.error("Tipo de arquivo não suportado.");
    }
  };

  // saida de audio
  const speakLastMessage = () => {
  const last = messages[messages.length - 1];

  // Interrompe qualquer fala anterior
  speechSynthesis.cancel();
  if (last?.role === "assistant") {
    const utterance = new SpeechSynthesisUtterance(last.content);
    utterance.lang = "pt-BR"; // ou "en-US" se for inglês
    speechSynthesis.speak(utterance);
    toast.info("Lendo resposta em voz...");
  } else {
    toast.info("Nada para ler ainda!");
  }
};


  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // scrool automatico
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <div className={`chat-container ${darkMode ? "dark" : ""}`}>
      <ToastContainer />
      <div className="header">
        <div className="logo-title">
          <img src={MagoLogo} alt="Logo Mago" className="logo-img"/>
          <h1>Dr. Botica responde</h1>
        </div>
        <button onClick={toggleTheme}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === "user" ? "🧑" : "🤖"}</div>
            <div className="text">{msg.content}</div>
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
        <button onClick={sendMessage}><FaPaperPlane /></button>
        <button onClick={copyLastMessage}><FaCopy /></button>
        <button onClick={clearInput}><FaEraser /></button>
        <button onClick={exportHistory}><FaDownload /></button>
        <button onClick={startListening}><FaMicrophone /></button>
        <button onClick={speakLastMessage}><FaVolumeUp /></button>

        <label className="upload-btn">
          <FaUpload />
          <input type="file" onChange={handleFileUpload} hidden />
        </label>
      </div>
    </div>
  );
};

export default ChatApp;
