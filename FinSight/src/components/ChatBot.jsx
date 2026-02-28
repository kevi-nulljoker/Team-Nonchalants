import { useEffect, useRef, useState } from "react";

const CHATBOT_BASE = (import.meta.env.VITE_CHATBOT_URL || "/api").trim().replace(/\/$/, "");
const CHAT_ENDPOINT = CHATBOT_BASE.endsWith("/chat") ? CHATBOT_BASE : `${CHATBOT_BASE}/chat`;

const QUICK_PROMPTS = [
  "How should I split my salary?",
  "How can I reduce monthly expenses?",
  "Is SIP better than fixed deposit?",
];

async function getBotReply(message, signal) {
  const res = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    signal,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const reply = typeof data?.reply === "string" ? data.reply.trim() : "";

  if (!res.ok) {
    throw new Error(reply || `Request failed: ${res.status}`);
  }

  if (!reply) {
    throw new Error("Empty response from backend chatbot.");
  }

  return reply;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello. I am your FinSight assistant powered by backend/ChatBot.py.",
    },
  ]);

  const listRef = useRef(null);
  const pendingRef = useRef(false);
  const lastSentRef = useRef({ text: "", at: 0 });
  const lastReplyRef = useRef({ text: "", at: 0 });
  const activeAbortRef = useRef(null);

  const appendMessage = (next) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === next.role && last.text === next.text) return prev;
      return [...prev, next];
    });
  };

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  const submitText = async (rawText) => {
    const text = rawText.trim();
    const normalizedText = text.toLowerCase();
    const now = Date.now();
    if (!text || loading || pendingRef.current) return;
    if (lastSentRef.current.text === normalizedText && now - lastSentRef.current.at < 1200) return;

    setInput("");
    appendMessage({ role: "user", text });
    pendingRef.current = true;
    lastSentRef.current = { text: normalizedText, at: now };
    setLoading(true);

    try {
      if (activeAbortRef.current) activeAbortRef.current.abort();
      const controller = new AbortController();
      activeAbortRef.current = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), 25000);
      let reply = "";
      try {
        reply = await getBotReply(text, controller.signal);
      } finally {
        window.clearTimeout(timeoutId);
      }
      const normalizedReply = reply.trim().toLowerCase();
      const isRapidDuplicate = lastReplyRef.current.text === normalizedReply && Date.now() - lastReplyRef.current.at < 1500;
      if (!isRapidDuplicate) {
        appendMessage({ role: "assistant", text: reply });
        lastReplyRef.current = { text: normalizedReply, at: Date.now() };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Backend chatbot is unavailable.";
      const friendlyMessage = message === "The operation was aborted."
        ? "Response timed out. Please try again."
        : message;
      appendMessage({
        role: "assistant",
        text:
          `backend/ChatBot.py error: ${friendlyMessage}\n` +
          "Start backend with: python backend/ChatBot.py",
      });
    } finally {
      activeAbortRef.current = null;
      pendingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => () => {
    if (activeAbortRef.current) activeAbortRef.current.abort();
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();
    await submitText(input);
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1300,
        fontFamily: "Inter, Segoe UI, sans-serif",
      }}
    >
      {open && (
        <div
          style={{
            width: "min(94vw, 390px)",
            height: "min(76vh, 540px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 18,
            border: "1px solid #d5e8df",
            background: "linear-gradient(180deg, #ffffff 0%, #f7fcf9 100%)",
            boxShadow: "0 22px 48px rgba(15, 34, 51, 0.24)",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "12px 14px",
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                AI
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.2 }}>FinSight Assistant</div>
                <div style={{ fontSize: 11, opacity: 0.9 }}>Backend: ChatBot.py</div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                border: "none",
                background: "rgba(255,255,255,0.16)",
                color: "#fff",
                width: 30,
                height: 30,
                borderRadius: 8,
                fontSize: 18,
                lineHeight: 1,
                cursor: "pointer",
                padding: 0,
                display: "grid",
                placeItems: "center",
              }}
            >
              x
            </button>
          </div>

          <div
            style={{
              padding: "10px 10px 0",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              borderBottom: "1px solid #e2eee8",
              background: "rgba(245,252,248,0.86)",
            }}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={loading}
                onClick={() => submitText(prompt)}
                style={{
                  border: "1px solid #c8ddd3",
                  background: "#ffffff",
                  color: "#1f3c55",
                  borderRadius: 999,
                  padding: "6px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background:
                "radial-gradient(circle at 90% 10%, rgba(37,99,235,0.10), transparent 30%), #f5f8ff",
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.role === "user";

              return (
                <div
                  key={`${m.role}-${idx}`}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "84%",
                      padding: "9px 11px",
                      borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: isUser ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "#ffffff",
                      border: isUser ? "none" : "1px solid #dbe8e0",
                      color: isUser ? "#ffffff" : "#122636",
                      fontSize: 13,
                      lineHeight: 1.45,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      boxShadow: isUser
                        ? "0 8px 18px rgba(37,99,235,0.28)"
                        : "0 3px 10px rgba(16,34,51,0.06)",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "8px 11px",
                    borderRadius: "14px 14px 14px 4px",
                    background: "#ffffff",
                    border: "1px solid #dbe8e0",
                    color: "#4b6279",
                    fontSize: 12,
                  }}
                >
                  Typing...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              padding: 10,
              borderTop: "1px solid #e2eee8",
              background: "#ffffff",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask anything about your money..."
              style={{
                flex: 1,
                border: "1px solid #c7ddd2",
                borderRadius: 11,
                padding: "10px 11px",
                fontSize: 13,
                outline: "none",
                color: "#0f2233",
                background: "#ffffff",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                border: "none",
                borderRadius: 11,
                minWidth: 72,
                padding: "10px 12px",
                background: loading ? "#AFC4F5" : "linear-gradient(135deg, #2563EB, #1D4ED8)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 12,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open chat"
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 12px 26px rgba(37, 99, 235, 0.36)",
          letterSpacing: 0.2,
        }}
      >
        {open ? "Close" : "Chat"}
      </button>
    </div>
  );
}
