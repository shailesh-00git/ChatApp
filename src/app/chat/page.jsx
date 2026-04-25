"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ChatWindow from "@/components/chatWindow";
import MessageInput from "@/components/MessageInput";
import UsernameModal from "@/components/UsernameModal";

function generateUsername() {
  const adj = ["Swift", "Calm", "Bold", "Keen", "Bright", "Quiet", "Warm"];
  const noun = ["Panda", "Falcon", "Otter", "Wolf", "Crane", "Fox", "Bear"];
  const num = Math.floor(Math.random() * 100);
  return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${num}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Load or prompt for username on mount
  useEffect(() => {
    const stored = localStorage.getItem("chat_username");
    if (stored) {
      setUsername(stored);
    } else {
      setShowModal(true);
    }
  }, []);

  // Fetch messages once we have a username
  useEffect(() => {
    if (!username) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (!error) setMessages(data ?? []);
      setLoading(false);
    };

    fetchMessages();
  }, [username]);

  // Realtime subscription
  useEffect(() => {
    if (!username) return;

    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const handleUsernameSubmit = (name) => {
    localStorage.setItem("chat_username", name);
    setUsername(name);
    setShowModal(false);
  };

  const sendMessage = async (content) => {
    const { error } = await supabase
      .from("messages")
      .insert([{ username, content }]);

    if (error) console.error("Send error:", error);
  };

  return (
    <div className="app">
      {showModal && (
        <UsernameModal
          suggested={generateUsername()}
          onSubmit={handleUsernameSubmit}
        />
      )}

      <header className="header">
        <div className="header-title">
          <span className="dot" />
          <h1>Chat Room</h1>
        </div>
        {username && (
          <button
            className="username-chip"
            onClick={() => setShowModal(true)}
            title="Change username"
          >
            {username}
          </button>
        )}
      </header>

      {loading ? (
        <div className="loading">
          <span className="spinner" />
        </div>
      ) : (
        <ChatWindow messages={messages} currentUser={username} />
      )}

      <MessageInput onSend={sendMessage} disabled={loading || !username} />
    </div>
  );
}
