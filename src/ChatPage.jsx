import { useEffect, useState } from "react";
import { useSiteData } from "./SiteDataContext";

// very basic skeleton; real implementation requires backend support and polling/websockets
export default function ChatPage({ orderId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { authToken } = useSiteData();

  useEffect(() => {
    if (!orderId) return;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderId}/chat`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [orderId, authToken]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setText("");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="page chat-page">
      <h1>Chat do pedido {orderId}</h1>
      <div className="chat-history">
        {messages.map((m) => (
          <div key={m.id} className="chat-message">
            <span className="chat-sender">{m.senderId === null ? "Loja" : "Você"}:</span> {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          placeholder="Escreva uma mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
