import React, { useState, useEffect, useRef } from 'react';
import {
  FaComments,
  FaPaperPlane,
  FaTimes,
  FaUserMd,
  FaUser,
  FaShieldAlt,
  FaClock,
  FaCheckDouble
} from 'react-icons/fa';
import chatService from '../services/chatService';
import { playAdherenceChime } from '../utils/audioChime';
import API_BASE_URL from '../config';
import './RealtimeChatModal.css';

const RealtimeChatModal = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  currentUser,
  token,
  latestLiveMessage
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const effectiveToken = token || localStorage.getItem('token') || '';
  let effectiveUser = currentUser;
  if ((!effectiveUser || !effectiveUser.id) && effectiveToken) {
    try {
      const decoded = JSON.parse(atob(effectiveToken.split('.')[1]));
      effectiveUser = { id: decoded.id, role: decoded.role };
    } catch (e) {}
  }

  const isDoctor = effectiveUser?.role === 'doctor';
  const myUserId = effectiveUser?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial chat history and maintain 1.5s live polling
  useEffect(() => {
    if (!isOpen || !patientId || !effectiveToken) return;

    let isMounted = true;
    const fetchHistory = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const { data } = await chatService.getMessages(patientId, effectiveToken);
        if (isMounted && data) {
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        if (isMounted && showLoading) {
          setLoading(false);
          setTimeout(scrollToBottom, 100);
        }
      }
    };

    fetchHistory(true);

    // Reliable 1.5s background polling ensures immediate sync between doctor & patient
    const pollInterval = setInterval(() => {
      fetchHistory(false);
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, patientId, effectiveToken]);

  // Built-in live SSE connection for instant message arrival
  useEffect(() => {
    if (!isOpen || !patientId || !effectiveToken) return;

    const sseUrl = `${API_BASE_URL}/api/realtime/stream?patient_id=${patientId}&token=${encodeURIComponent(effectiveToken)}`;
    let eventSource;

    try {
      eventSource = new EventSource(sseUrl);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'CHAT_MESSAGE_RECEIVED' && payload.message) {
            const incomingMsg = payload.message;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incomingMsg.id)) return prev;
              if (Number(incomingMsg.sender_id) !== Number(myUserId)) {
                if (localStorage.getItem('medtracker_sound_enabled') !== 'false') {
                  playAdherenceChime();
                }
              }
              return [...prev, incomingMsg];
            });
            setTimeout(scrollToBottom, 50);
          }
        } catch (err) {
          console.error('SSE chat parse error:', err);
        }
      };
    } catch (err) {
      console.error('Failed to connect chat SSE:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isOpen, patientId, effectiveToken, myUserId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const { data } = await chatService.sendMessage(patientId, messageText, effectiveToken);
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please check your connection.');
      setInputText(messageText); // restore on error
    } finally {
      setSending(false);
    }
  };

  const handlePresetClick = (preset) => {
    setInputText(preset);
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="chat-modal-content" role="dialog" aria-modal="true" aria-labelledby="chat-dialog-title">
        {/* Chat Header */}
        <div className="chat-modal-header">
          <div className="chat-header-info">
            <div className="chat-header-badge">
              <FaComments />
            </div>
            <div>
              <h3 id="chat-dialog-title">Direct Clinical Messenger</h3>
              <p className="chat-header-meta">
                Patient: <strong>{patientName || `ID #${patientId}`}</strong> •{' '}
                <span className="chat-live-pulse-dot" /> Live End-to-End Synced
              </p>
            </div>
          </div>
          <button type="button" className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            <FaTimes />
          </button>
        </div>

        {/* Security & Confidentiality Tag */}
        <div className="chat-security-strip">
          <FaShieldAlt className="sec-icon" />
          <span>Encrypted Clinical Channel • Authorized Care Team Only</span>
        </div>

        {/* Message Thread Container */}
        <div className="chat-messages-scroll-area">
          {loading ? (
            <div className="chat-loading-box">
              <span className="chat-loading-spinner" />
              <p>Loading secure conversation history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-box">
              <div className="chat-empty-icon">💬</div>
              <h4>No Messages Yet</h4>
              <p>
                {isDoctor
                  ? `Initiate a direct consultation update or follow-up with ${patientName || 'this patient'}.`
                  : 'Send a direct message or report symptoms to your assigned physician.'}
              </p>
            </div>
          ) : (
            <div className="chat-messages-list">
              {messages.map((msg) => {
                const isMine = msg.sender_id === myUserId;
                const isMsgDoctor = msg.sender_role === 'doctor';
                const timeStr = msg.created_at
                  ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={msg.id || `${msg.created_at}-${msg.sender_id}`}
                    className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}
                  >
                    <div className="chat-sender-avatar">
                      {isMsgDoctor ? <FaUserMd /> : <FaUser />}
                    </div>
                    <div className="chat-bubble-container">
                      <div className="chat-bubble-meta">
                        <span className="chat-sender-name">{msg.sender_name}</span>
                        <span className="chat-time-stamp">
                          <FaClock className="mini-clock" /> {timeStr}
                        </span>
                      </div>
                      <div className={`chat-bubble-text ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                        {msg.message_text}
                      </div>
                      {isMine && (
                        <div className="chat-status-delivered">
                          <FaCheckDouble className="delivered-icon" /> Delivered
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div className="chat-bubble-row theirs typing-indicator-row">
                  <div className="chat-sender-avatar">
                    <FaUserMd />
                  </div>
                  <div className="typing-pulse-bubble">
                    <span className="typing-dot dot-1" />
                    <span className="typing-dot dot-2" />
                    <span className="typing-dot dot-3" />
                    <span className="typing-text">Transmitting telemetry...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Quick Clinical Presets */}
        <div className="chat-presets-bar">
          <span className="presets-label">Quick Prompts:</span>
          {isDoctor ? (
            <>
              <button
                type="button"
                className="preset-pill"
                onClick={() => handlePresetClick('Please confirm if you have taken your morning dose.')}
              >
                Confirm morning dose
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() => handlePresetClick('Your adherence trend is on track. Keep up the consistency!')}
              >
                Adherence on track
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() => handlePresetClick('Please review your newly uploaded diagnostic lab report.')}
              >
                Lab report review
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="preset-pill"
                onClick={() => handlePresetClick('I have taken my prescribed medication today.')}
              >
                Dose taken today
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() => handlePresetClick('Experiencing mild side effects, requesting guidance.')}
              >
                Report side effects
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() => handlePresetClick('Could you review my upcoming refill schedule?')}
              >
                Refill inquiry
              </button>
            </>
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            className="chat-text-input"
            placeholder={isDoctor ? 'Type physician instructions or advisory...' : 'Type message to your physician...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            maxLength={2000}
            required
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={sending || !inputText.trim()}
            aria-label="Send message"
          >
            <FaPaperPlane />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RealtimeChatModal;