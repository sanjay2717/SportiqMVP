import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/AuthProvider';
import { messageService } from '../../services/messageService';
import { Message } from '../../types';
import styles from './PrivateChatScreen.module.css';
import { supabase } from '../../../../core/database/supabaseClient';

export function PrivateChatScreen() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    async function loadData() {
      if (!conversationId) return;
      try {
        const msgs = await messageService.getMessages(conversationId);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to load messages', err);
        setError('Conversation not found or unauthorized.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [conversationId]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = messageService.subscribeToMessages(conversationId, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (isSending) return;
    if (!inputText.trim() || !user || !conversationId) return;
    setIsSending(true);
    try {
      await messageService.sendMessage(conversationId, user.id, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Private Chat</h1>
        </div>
        <div className={styles.spacer} />
      </header>

      {/* Chat Area */}
      <main className={styles.chatArea}>
        {error ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)' }}>lock</span>
            <p className={styles.emptyStateText}>{error}</p>
          </div>
        ) : isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={`${styles.skeletonBubble} ${styles.skeletonLeft}`} />
            <div className={`${styles.skeletonBubble} ${styles.skeletonRight}`} />
            <div className={`${styles.skeletonBubble} ${styles.skeletonRight}`} />
            <div className={`${styles.skeletonBubble} ${styles.skeletonLeft}`} />
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No messages yet. Send a message to start the conversation.</p>
          </div>
        ) : (
          <div className={styles.messageList}>
            {messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
                >
                  <div className={styles.messageBubble}>
                    <p className={styles.messageContent}>{msg.content}</p>
                  </div>
                  <span className={styles.messageTime}>{formatTime(msg.created_at)}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      {!error && (
        <footer className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <textarea
              className={styles.inputField}
              placeholder="Message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </footer>
      )}
    </div>
  );
}
