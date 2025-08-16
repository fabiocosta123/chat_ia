
---

## 📄 README.md — Copilot Clone com Gemini

```markdown
# 🧠 Copilot Clone com Gemini

Este projeto é um clone funcional do Copilot, construído com React e integrado à API Gemini da Google. Ele permite conversas com IA, entrada por voz, leitura de respostas em áudio, upload de arquivos, exportação de histórico e modo escuro.

---

## 🚀 Tecnologias Utilizadas

- **React + Vite** — Framework moderno para desenvolvimento web
- **Google Generative AI SDK** — Integração com a API Gemini
- **Web Speech API** — Entrada e saída de voz no navegador
- **React Icons** — Ícones interativos
- **React Toastify** — Notificações amigáveis
- **CSS personalizado** — Estilização com suporte a modo escuro

---

## 🔐 API Utilizada

- **Google Gemini API**  
  - Modelo: `gemini-1.5-pro` ou `gemini-1.5-flash`  
  - Chave gerada via [Google AI Studio](https://aistudio.google.com/app/apikey)  
  - SDK: `@google/generative-ai`

---

## 📦 Dependências

Instale com:

```bash
npm install @google/generative-ai react-icons react-toastify
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_GEMINI_API_KEY=AIza...sua_chave_aqui
```

---

## 🧠 Funcionalidades

### 💬 Chat com IA
- Envia mensagens para o modelo Gemini
- Recebe respostas inteligentes e contextuais

### 🎙️ Entrada por voz
- Usa o microfone para capturar texto
- Reconhecimento de fala via Web Speech API

### 🔊 Leitura de resposta
- Lê a última resposta do assistente em voz alta
- Suporte a português e inglês

### 📁 Upload de arquivos
- Aceita arquivos `.txt` e `.pdf`
- Carrega o conteúdo no campo de input

### 📄 Exportar histórico
- Gera um arquivo `.txt` com toda a conversa
- Download automático com nome `historico_chat.txt`

### 🌙 Modo escuro
- Alterna entre tema claro e escuro
- Estilização suave com transições

---

## 🖱️ Função de cada botão

| Ícone           | Função                              |
|----------------|--------------------------------------|
| 📨 (PaperPlane) | Enviar mensagem para a IA            |
| 📋 (Copy)       | Copiar a última resposta da IA       |
| 🧽 (Eraser)     | Limpar o campo de texto              |
| 📥 (Download)   | Exportar histórico como `.txt`       |
| 🎙️ (Microphone)| Capturar texto por voz               |
| 🔊 (VolumeUp)   | Ouvir a última resposta em áudio     |
| 📁 (Upload)     | Carregar arquivo `.txt` ou `.pdf`    |
| 🌙 / ☀️         | Alternar entre modo escuro e claro   |

---

## 📌 Observações

- A chave da API deve ser gerada no [Google AI Studio](https://aistudio.google.com/app/apikey)
- O projeto salva o histórico no `localStorage`
- O campo de input é validado para evitar envios vazios
- O modo escuro não afeta a legibilidade do título ou botões

---

## 🧪 Teste local

```bash
npm install
npm run dev
```

---

## 📤 Deploy sugerido

- **Vercel** ou **Netlify**
- Lembre-se de configurar a variável `VITE_GEMINI_API_KEY` no painel de ambiente

---

## 📚 Créditos

Projeto desenvolvido por [Fábio] com suporte do Copilot AI.  
Inspirado na experiência do Microsoft Copilot, adaptado para uso com a API Gemini.

```


