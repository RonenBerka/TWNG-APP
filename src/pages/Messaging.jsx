import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Send,
  ArrowLeft,
  Paperclip,
  Check,
  CheckCheck,
  MessageSquare,
  Plus,
  Loader,
  AlertCircle,
  X,
  Smile,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
  subscribeToConversation,
  subscribeToIncomingMessages,
  generateThreadId,
} from "../lib/supabase/messaging";

// Format time for conversation list
const formatTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Format time for message bubbles
const formatMessageTime = (date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Get date separator text
const getDateSeparator = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return "Today";
  if (msgDate.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Avatar fallback URL
const avatarFallback = (username) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=random`;

// ─── Conversation list item ───────────────────────────────────────────────────
const ConversationItem = ({ conversation, isActive, onClick }) => {
  const otherUser = conversation.other_user;
  if (!otherUser) return null;

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: isActive ? "rgba(217, 119, 6, 0.12)" : "transparent",
        borderBottomColor: T.border,
      }}
      className="w-full px-4 py-3 hover:bg-opacity-75 transition-all text-left flex items-center gap-3 border-b"
    >
      <div className="relative flex-shrink-0">
        <img
          src={otherUser.avatar_url || avatarFallback(otherUser.username)}
          alt={otherUser.username}
          className="w-11 h-11 rounded-full object-cover"
          onError={(e) => {
            e.target.src = avatarFallback(otherUser.username);
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <h3
            style={{ color: T.txt }}
            className="font-semibold text-sm truncate"
          >
            {otherUser.display_name || otherUser.username}
          </h3>
          <span style={{ color: T.txtM }} className="text-xs flex-shrink-0">
            {formatTime(new Date(conversation.last_message_at))}
          </span>
        </div>
        <p style={{ color: T.txt2 }} className="text-xs truncate">
          {conversation.last_message}
        </p>
      </div>
      {conversation.unread_count > 0 && (
        <div
          style={{ backgroundColor: T.warm, color: "#fff" }}
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        >
          {conversation.unread_count}
        </div>
      )}
    </button>
  );
};

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = message.sender_id === currentUserId;
  const isSystem = message.type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <p style={{ color: T.txtM }} className="text-xs text-center">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", marginBottom: 8 }}
    >
      {/* Other user avatar */}
      {!isOwn && (
        <img
          src={
            message.sender?.avatar_url ||
            avatarFallback(message.sender?.username || "user")
          }
          alt=""
          style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8, marginTop: 4, flexShrink: 0 }}
          onError={(e) => {
            e.target.src = avatarFallback(message.sender?.username || "user");
          }}
        />
      )}
      {/* Bubble */}
      <div
        style={{
          maxWidth: "70%",
          backgroundColor: isOwn ? T.warm : T.bgCard,
          color: isOwn ? "#fff" : T.txt,
          borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "10px 14px",
          wordBreak: "break-word",
        }}
      >
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{message.content}</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
            justifyContent: isOwn ? "flex-end" : "flex-start",
          }}
        >
          <span style={{ fontSize: 10, color: isOwn ? "rgba(255,255,255,0.7)" : T.txtM }}>
            {formatMessageTime(new Date(message.created_at))}
          </span>
          {isOwn &&
            (message.is_read ? (
              <CheckCheck size={12} style={{ color: "rgba(255,255,255,0.7)" }} />
            ) : (
              <Check size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
            ))}
        </div>
      </div>
    </div>
  );
};

// ─── New message modal ────────────────────────────────────────────────────────
const NewMessageModal = ({ isOpen, onClose, onSendMessage, isLoading }) => {
  const [newMessageUsername, setNewMessageUsername] = useState("");

  const handleSubmit = () => {
    if (newMessageUsername.trim()) {
      onSendMessage(newMessageUsername.trim());
      setNewMessageUsername("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div
        style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}` }}
        className="rounded-xl p-6 w-96 max-w-[90vw]"
      >
        <h2 style={{ color: T.txt }} className="text-lg font-bold mb-4">
          Start New Conversation
        </h2>
        <input
          type="text"
          placeholder="Enter username..."
          value={newMessageUsername}
          onChange={(e) => setNewMessageUsername(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !isLoading) handleSubmit();
          }}
          style={{
            color: T.txt,
            backgroundColor: T.bgElev,
            borderColor: T.border,
          }}
          className="w-full px-3 py-2 rounded-lg border mb-4 outline-none text-sm"
          disabled={isLoading}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            style={{ backgroundColor: T.bgElev, color: T.txt }}
            className="px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{ backgroundColor: T.warm, color: "#fff" }}
            className="px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            disabled={!newMessageUsername.trim() || isLoading}
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Contact profile panel (right side) ───────────────────────────────────────
const ContactProfile = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div
      style={{
        width: 280,
        backgroundColor: T.bgCard,
        borderLeft: `1px solid ${T.border}`,
      }}
      className="flex-shrink-0 flex flex-col h-full overflow-y-auto"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: T.border }}
      >
        <h3 style={{ color: T.txt }} className="font-semibold text-sm">
          Profile
        </h3>
        <button
          onClick={onClose}
          className="hover:opacity-70 transition-opacity"
          aria-label="Close profile"
        >
          <X size={18} style={{ color: T.txt2 }} />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center pt-6 pb-4 px-4">
        <img
          src={user.avatar_url || avatarFallback(user.username)}
          alt={user.username}
          className="w-28 h-28 rounded-full object-cover mb-4"
          onError={(e) => {
            e.target.src = avatarFallback(user.username);
          }}
        />
        <h2 style={{ color: T.txt }} className="font-bold text-base">
          {user.display_name || user.username}
        </h2>
        <p style={{ color: T.txt2 }} className="text-xs mt-1">
          @{user.username}
        </p>
      </div>

      {/* Info section */}
      {user.bio && (
        <div className="px-4 py-3 border-t" style={{ borderColor: T.border }}>
          <p
            style={{ color: T.txt2 }}
            className="text-xs font-medium uppercase tracking-wider mb-1"
          >
            Bio
          </p>
          <p style={{ color: T.txt }} className="text-sm">
            {user.bio}
          </p>
        </div>
      )}

      {/* View profile link */}
      <div className="px-4 py-3 border-t" style={{ borderColor: T.border }}>
        <Link
          to={`/user/${user.username}`}
          style={{ color: T.warm }}
          className="text-sm hover:underline"
        >
          View full profile
        </Link>
      </div>
    </div>
  );
};

// ─── Message input bar ────────────────────────────────────────────────────────
const MessageInput = ({ messageInput, setMessageInput, onSend, isSending }) => (
  <div
    style={{
      borderTop: `1px solid ${T.border}`,
      backgroundColor: T.bgCard,
    }}
    className="px-4 py-3 flex-shrink-0"
  >
    <div
      style={{
        backgroundColor: T.bgElev,
        borderColor: T.border,
      }}
      className="border rounded-xl flex items-end gap-2 px-3 py-2.5"
    >
      <button
        className="hover:opacity-70 transition-opacity flex-shrink-0 pb-0.5"
        aria-label="Attach file"
      >
        <Paperclip size={18} style={{ color: T.txt2 }} />
      </button>
      <textarea
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Write a message..."
        style={{
          color: T.txt,
          backgroundColor: "transparent",
        }}
        className="flex-1 outline-none text-sm resize-none max-h-24"
        rows="1"
        disabled={isSending}
      />
      <button
        className="hover:opacity-70 transition-opacity flex-shrink-0 pb-0.5"
        aria-label="Emoji"
      >
        <Smile size={18} style={{ color: T.txt2 }} />
      </button>
      <button
        onClick={onSend}
        disabled={!messageInput.trim() || isSending}
        style={{
          backgroundColor:
            messageInput.trim() && !isSending ? T.warm : T.bgElev,
          color: messageInput.trim() && !isSending ? "#fff" : T.txtM,
        }}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
        aria-label="Send message"
      >
        {isSending ? (
          <Loader size={14} className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Main messaging component
// ═══════════════════════════════════════════════════════════════════════════════
export default function TWNGMessaging() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [isCreatingNewConversation, setIsCreatingNewConversation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesSubscriptionRef = useRef(null);
  const conversationsSubscriptionRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setIsLoadingConversations(true);
      setError(null);
      try {
        const data = await getConversations();
        setConversations(data);
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0]);
        }
      } catch (err) {
        console.error("Error loading conversations:", err);
        setError("Failed to load conversations.");
      } finally {
        setIsLoadingConversations(false);
      }
    };

    const setupSubscriptions = async () => {
      try {
        conversationsSubscriptionRef.current =
          await subscribeToIncomingMessages(() => {
            loadConversations();
          });
      } catch (err) {
        console.error("Error setting up subscription:", err);
      }
    };

    loadConversations();
    setupSubscriptions();

    return () => {
      if (conversationsSubscriptionRef.current) {
        conversationsSubscriptionRef.current.unsubscribe();
      }
    };
  }, [user]);

  // Load messages when conversation changes — pass two user IDs (not thread_id)
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const otherUserId = selectedConversation.other_user?.id;
    if (!otherUserId) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      setError(null);
      try {
        // Mark conversation as read (pass sender = other user's ID)
        await markConversationAsRead(otherUserId);
        // Fetch messages between the two users
        const data = await getMessages(user.id, otherUserId);
        setMessages(data);

        // Subscribe to new messages in this conversation
        if (messagesSubscriptionRef.current) {
          messagesSubscriptionRef.current.unsubscribe();
        }
        messagesSubscriptionRef.current = await subscribeToConversation(
          otherUserId,
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newMsg = payload.new;
              // Attach sender info for display
              if (newMsg.sender_id === otherUserId) {
                newMsg.sender = selectedConversation.other_user;
              }
              setMessages((prev) => [...prev, newMsg]);
            }
          }
        );
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load messages.");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();

    return () => {
      if (messagesSubscriptionRef.current) {
        messagesSubscriptionRef.current.unsubscribe();
      }
    };
  }, [selectedConversation, user]);

  // Responsive
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (messagesSubscriptionRef.current)
        messagesSubscriptionRef.current.unsubscribe();
      if (conversationsSubscriptionRef.current)
        conversationsSubscriptionRef.current.unsubscribe();
    };
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.other_user;
    if (!otherUser) return false;
    const name = otherUser.display_name || otherUser.username || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user || isSendingMessage)
      return;

    setIsSendingMessage(true);
    setError(null);
    try {
      await sendMessage({
        recipientId: selectedConversation.other_user.id,
        content: messageInput.trim(),
      });
      setMessageInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleNewMessage = async (username) => {
    setIsCreatingNewConversation(true);
    setError(null);
    try {
      const { supabase } = await import("../lib/supabase/client");
      const { data: foundUsers, error: searchErr } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .ilike("username", `%${username}%`)
        .limit(1);

      if (searchErr) throw searchErr;
      if (!foundUsers || foundUsers.length === 0) {
        setError(`User "${username}" not found.`);
        return;
      }

      const targetUser = foundUsers[0];
      const threadId = generateThreadId(user.id, targetUser.id);
      const existing = conversations.find((c) => c.thread_id === threadId);
      if (existing) {
        setSelectedConversation(existing);
        setShowNewMessageModal(false);
        return;
      }

      const newConvo = {
        thread_id: threadId,
        other_user: targetUser,
        last_message: "",
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      };
      setConversations((prev) => [newConvo, ...prev]);
      setSelectedConversation(newConvo);
      setShowNewMessageModal(false);
    } catch (err) {
      console.error("Error creating new conversation:", err);
      setError("Failed to create conversation.");
    } finally {
      setIsCreatingNewConversation(false);
    }
  };

  // ─── Messages list render ──────────────────────────────────────────────────
  const renderMessages = () => {
    if (isLoadingMessages) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader size={32} style={{ color: T.txtM }} className="animate-spin" />
        </div>
      );
    }

    if (messages.length > 0) {
      return messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateSeparator =
          !prevMessage ||
          getDateSeparator(new Date(prevMessage.created_at)) !==
            getDateSeparator(new Date(message.created_at));
        return (
          <div key={message.id}>
            {showDateSeparator && (
              <div className="flex justify-center my-4">
                <span
                  style={{
                    color: T.txtM,
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`,
                  }}
                  className="text-xs px-3 py-1 rounded-full"
                >
                  {getDateSeparator(new Date(message.created_at))}
                </span>
              </div>
            )}
            <MessageBubble message={message} currentUserId={user?.id} />
          </div>
        );
      });
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <MessageSquare size={48} style={{ color: T.txtM }} />
        <p style={{ color: T.txt2 }} className="text-sm mt-4">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  };

  // ─── Mobile view ──────────────────────────────────────────────────────────
  if (isMobileView) {
    if (showMobileList) {
      return (
        <div
          style={{ backgroundColor: T.bgDeep, color: T.txt, height: "calc(100vh - 64px)" }}
          className="w-full flex flex-col"
        >
          <div
            style={{ borderColor: T.border, backgroundColor: T.bgCard }}
            className="border-b px-4 py-3 flex items-center justify-between flex-shrink-0"
          >
            <h1 className="text-lg font-bold">Chats</h1>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{ backgroundColor: T.warm }}
              aria-label="New message"
            >
              <Plus size={16} style={{ color: "#fff" }} />
            </button>
          </div>

          {error && (
            <div
              style={{ backgroundColor: T.bgCard, color: T.txt, borderColor: T.border }}
              className="mx-4 mt-3 p-3 rounded-lg border flex items-center gap-2 flex-shrink-0"
            >
              <AlertCircle size={16} style={{ color: T.warm }} className="flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="p-3 flex-shrink-0">
            <div
              style={{ borderColor: T.border, backgroundColor: T.bgElev }}
              className="border rounded-lg flex items-center px-3 py-2 gap-2"
            >
              <Search size={16} style={{ color: T.txtM }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: T.txt, backgroundColor: "transparent" }}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader size={32} style={{ color: T.txtM }} className="animate-spin mb-3" />
                <p style={{ color: T.txt2 }} className="text-sm">Loading...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.thread_id}
                  conversation={conv}
                  isActive={selectedConversation?.thread_id === conv.thread_id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setShowMobileList(false);
                  }}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare size={32} style={{ color: T.txtM }} />
                <p style={{ color: T.txt2 }} className="text-sm mt-2">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            )}
          </div>

          <NewMessageModal
            isOpen={showNewMessageModal}
            onClose={() => setShowNewMessageModal(false)}
            onSendMessage={handleNewMessage}
            isLoading={isCreatingNewConversation}
          />
        </div>
      );
    }

    // Mobile conversation view
    return (
      <div
        style={{ backgroundColor: T.bgDeep, color: T.txt, height: "calc(100vh - 64px)" }}
        className="w-full flex flex-col"
      >
        {/* Header */}
        <div
          style={{ borderColor: T.border, backgroundColor: T.bgCard }}
          className="border-b px-4 py-3 flex items-center gap-3 flex-shrink-0"
        >
          <button
            onClick={() => setShowMobileList(true)}
            className="hover:opacity-70 transition-opacity"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          {selectedConversation && (
            <>
              <img
                src={selectedConversation.other_user.avatar_url || avatarFallback(selectedConversation.other_user.username)}
                alt={selectedConversation.other_user.username}
                className="w-9 h-9 rounded-full"
                onError={(e) => { e.target.src = avatarFallback(selectedConversation.other_user.username); }}
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm truncate">
                  {selectedConversation.other_user.display_name || selectedConversation.other_user.username}
                </h2>
              </div>
            </>
          )}
        </div>

        {error && (
          <div
            style={{ backgroundColor: T.bgCard, color: T.txt, borderColor: T.border }}
            className="mx-4 mt-3 p-3 rounded-lg border flex items-center gap-2 flex-shrink-0"
          >
            <AlertCircle size={16} style={{ color: T.warm }} className="flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-1"
          style={{ backgroundColor: T.bgDeep }}
        >
          {renderMessages()}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <MessageInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSend={handleSendMessage}
          isSending={isSendingMessage}
        />
      </div>
    );
  }

  // ─── Desktop: 3-panel layout ────────────────────────────────────────────────
  return (
    <>
      <div
        style={{ backgroundColor: T.bgDeep, color: T.txt, height: "calc(100vh - 64px)" }}
        className="w-full flex"
      >
        {/* ─── Left panel: Chats list ─────────────────────────────────────── */}
        <div
          style={{
            width: 320,
            borderRight: `1px solid ${T.border}`,
            backgroundColor: T.bgCard,
          }}
          className="flex-shrink-0 flex flex-col h-full"
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between border-b flex-shrink-0"
            style={{ borderColor: T.border }}
          >
            <h1 style={{ color: T.txt }} className="text-lg font-bold">
              Chats
            </h1>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{ backgroundColor: T.warm }}
              aria-label="New chat"
              disabled={isCreatingNewConversation}
            >
              {isCreatingNewConversation ? (
                <Loader size={16} className="animate-spin" style={{ color: "#fff" }} />
              ) : (
                <Plus size={16} style={{ color: "#fff" }} />
              )}
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0">
            <div
              style={{ backgroundColor: T.bgElev, borderColor: T.border }}
              className="border rounded-lg flex items-center px-3 py-2 gap-2"
            >
              <Search size={15} style={{ color: T.txtM }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: T.txt, backgroundColor: "transparent" }}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{ backgroundColor: T.bgElev, color: T.txt, borderColor: T.border }}
              className="mx-3 mb-2 p-2.5 rounded-lg border flex items-center gap-2 flex-shrink-0"
            >
              <AlertCircle size={14} style={{ color: T.warm }} className="flex-shrink-0" />
              <p className="text-xs flex-1">{error}</p>
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader size={28} style={{ color: T.txtM }} className="animate-spin mb-3" />
                <p style={{ color: T.txt2 }} className="text-sm">Loading...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.thread_id}
                  conversation={conv}
                  isActive={selectedConversation?.thread_id === conv.thread_id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setShowProfile(false);
                  }}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare size={28} style={{ color: T.txtM }} />
                <p style={{ color: T.txt2 }} className="text-sm mt-2">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Center panel: Conversation ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div
                style={{
                  borderBottom: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                }}
                className="px-4 py-3 flex items-center justify-between flex-shrink-0"
              >
                <button
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <img
                    src={
                      selectedConversation.other_user.avatar_url ||
                      avatarFallback(selectedConversation.other_user.username)
                    }
                    alt={selectedConversation.other_user.username}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = avatarFallback(selectedConversation.other_user.username);
                    }}
                  />
                  <div className="text-left">
                    <h2 style={{ color: T.txt }} className="font-bold text-sm">
                      {selectedConversation.other_user.display_name ||
                        selectedConversation.other_user.username}
                    </h2>
                  </div>
                </button>
              </div>

              {/* Messages area */}
              <div
                className="flex-1 overflow-y-auto"
                style={{ backgroundColor: T.bgDeep, padding: "16px 24px" }}
              >
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <MessageInput
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                onSend={handleSendMessage}
                isSending={isSendingMessage}
              />
            </>
          ) : (
            // No conversation selected
            <div
              className="flex-1 flex flex-col items-center justify-center"
              style={{ backgroundColor: T.bgDeep }}
            >
              <MessageSquare size={48} style={{ color: T.txtM }} />
              <p style={{ color: T.txt2 }} className="text-sm mt-4">
                Select a conversation or start a new one
              </p>
            </div>
          )}
        </div>

        {/* ─── Right panel: Contact profile (always visible on desktop) ──── */}
        {selectedConversation && (
          <ContactProfile
            user={selectedConversation.other_user}
            onClose={() => setShowProfile(false)}
          />
        )}
      </div>

      {/* New message modal */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onSendMessage={handleNewMessage}
        isLoading={isCreatingNewConversation}
      />
    </>
  );
}
