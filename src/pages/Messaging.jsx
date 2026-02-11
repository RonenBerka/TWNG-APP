import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Send,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Image,
  Check,
  CheckCheck,
  MessageSquare,
  Plus,
  Loader,
  AlertCircle,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getConversations,
  getMessages,
  sendMessage,
  markThreadAsRead,
  subscribeToMessages,
  subscribeToNewConversations,
  generateThreadId,
} from "../lib/supabase/messaging";

// Format time for display
const formatTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Format time for message display
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

// Conversation item component
const ConversationItem = ({
  conversation,
  isActive,
  onClick,
  isMobile,
}) => {
  const otherUser = conversation.other_user;
  if (!otherUser) return null;

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: isActive ? T.bgCard : "transparent",
        borderLeft: `3px solid ${isActive ? T.warm : "transparent"}`,
        borderBottomColor: T.border,
      }}
      className="w-full px-4 py-3 hover:bg-opacity-75 transition-all text-left flex items-center gap-3 border-b"
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <img
          src={otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.username}&backgroundColor=random`}
          alt={otherUser.username}
          className="w-11 h-11 rounded-full object-cover"
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.username}&backgroundColor=random`;
          }}
        />
        {/* Online status indicator placeholder - can be enhanced with presence tracking */}
        {/* <div
          style={{ backgroundColor: "#10b981" }}
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-current"
        /> */}
      </div>

      {/* Message preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 style={{ color: T.txt }} className="font-semibold text-sm">
            {otherUser.username}
          </h3>
          <span style={{ color: T.txtM }} className="text-xs font-mono">
            {formatTime(new Date(conversation.last_message_at))}
          </span>
        </div>
        <p
          style={{ color: T.txt2 }}
          className="text-xs truncate"
        >
          {conversation.last_message}
        </p>
      </div>

      {/* Unread badge */}
      {conversation.unread_count > 0 && (
        <div
          style={{ backgroundColor: T.warm, color: T.bgDeep }}
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        >
          {conversation.unread_count}
        </div>
      )}
    </button>
  );
};

// Message bubble component
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
      className={`flex gap-2 mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {!isOwn && message.sender && (
        <img
          src={message.sender.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.username}&backgroundColor=random`}
          alt={message.sender.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.username}&backgroundColor=random`;
          }}
        />
      )}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div
          style={{
            backgroundColor: isOwn ? T.warm : T.bgCard,
            color: isOwn ? T.bgDeep : T.txt,
          }}
          className="px-3 py-2 rounded-lg max-w-xs break-words"
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span style={{ color: T.txtM }} className="text-xs font-mono">
            {formatMessageTime(new Date(message.created_at))}
          </span>
          {isOwn && (
            <div className="flex items-center">
              {/* Updated schema: is_read field (not read_at) */}
              {message.is_read ? (
                <CheckCheck
                  size={12}
                  style={{ color: T.amber }}
                />
              ) : (
                <Check
                  size={12}
                  style={{ color: T.txt2 }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// New message modal component
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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div
        style={{ backgroundColor: T.bgCard }}
        className="rounded-lg p-6 w-96 max-w-full"
      >
        <h2 style={{ color: T.txt }} className="text-lg font-bold mb-4">
          Start New Conversation
        </h2>
        <input
          type="text"
          placeholder="Enter username or email..."
          value={newMessageUsername}
          onChange={(e) => setNewMessageUsername(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSubmit();
            }
          }}
          style={{ color: T.txt, backgroundColor: T.bgElev, borderColor: T.border }}
          className="w-full px-3 py-2 rounded-lg border mb-4 outline-none text-sm"
          disabled={isLoading}
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
            style={{ backgroundColor: T.warm, color: T.bgDeep }}
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

// Main messaging component
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
  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesSubscriptionRef = useRef(null);
  const conversationsSubscriptionRef = useRef(null);

  // Load conversations on mount and subscribe to new ones
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setIsLoadingConversations(true);
      setError(null);
      try {
        const data = await getConversations();
        setConversations(data);
        // Auto-select first conversation if none selected and conversations exist
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0]);
        }
      } catch (err) {
        console.error("Error loading conversations:", err);
        setError("Failed to load conversations. Please try again.");
      } finally {
        setIsLoadingConversations(false);
      }
    };

    const setupSubscriptions = async () => {
      try {
        // Subscribe to new conversations
        conversationsSubscriptionRef.current = await subscribeToNewConversations(
          () => {
            // Reload conversations when new messages arrive
            loadConversations();
          }
        );
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

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      setError(null);
      try {
        // Updated: group by sender/recipient pairs (removed thread_id logic)
        // Mark conversation as read
        await markThreadAsRead(selectedConversation.thread_id);

        // Fetch messages
        const data = await getMessages(selectedConversation.thread_id);
        setMessages(data);

        // Subscribe to new messages in this thread
        if (messagesSubscriptionRef.current) {
          messagesSubscriptionRef.current.unsubscribe();
        }
        messagesSubscriptionRef.current = subscribeToMessages(
          selectedConversation.thread_id,
          async (payload) => {
            if (payload.eventType === "INSERT") {
              const newMsg = payload.new;
              // Attach sender info for display
              if (selectedConversation?.other_user && newMsg.sender_id === selectedConversation.other_user.id) {
                newMsg.sender = selectedConversation.other_user;
              } else if (newMsg.sender_id === user?.id) {
                newMsg.sender = { id: user.id, username: profile?.username, avatar_url: profile?.avatar_url };
              }
              setMessages((prev) => [...prev, newMsg]);
            }
          }
        );
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load messages. Please try again.");
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

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      if (messagesSubscriptionRef.current) {
        messagesSubscriptionRef.current.unsubscribe();
      }
      if (conversationsSubscriptionRef.current) {
        conversationsSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.other_user;
    if (!otherUser) return false;
    const username = otherUser.username || "";
    return username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user || isSendingMessage) {
      return;
    }

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
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleNewMessage = async (username) => {
    setIsCreatingNewConversation(true);
    setError(null);
    try {
      // Look up user by username
      const { supabase } = await import("../lib/supabase/client");
      const { data: foundUsers, error: searchErr } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .ilike('username', `%${username}%`)
        .limit(1);

      if (searchErr) throw searchErr;
      if (!foundUsers || foundUsers.length === 0) {
        setError(`User "${username}" not found.`);
        return;
      }

      const targetUser = foundUsers[0];

      // Check if conversation already exists
      const threadId = generateThreadId(user.id, targetUser.id);
      const existing = conversations.find(c => c.thread_id === threadId);
      if (existing) {
        setSelectedConversation(existing);
        setShowNewMessageModal(false);
        return;
      }

      // Create a virtual conversation entry so user can start typing
      const newConvo = {
        thread_id: threadId,
        other_user: targetUser,
        last_message: '',
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      };
      setConversations(prev => [newConvo, ...prev]);
      setSelectedConversation(newConvo);
      setShowNewMessageModal(false);
    } catch (err) {
      console.error("Error creating new conversation:", err);
      setError("Failed to create conversation. Please try again.");
    } finally {
      setIsCreatingNewConversation(false);
    }
  };

  const handlePhoneCall = () => {
    setToast("Phone calls coming soon!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleVideoCall = () => {
    setToast("Video calls coming soon!");
    setTimeout(() => setToast(null), 3000);
  };

  // Mobile: show list or conversation
  if (isMobileView) {
    if (showMobileList) {
      return (
        <div
          style={{ backgroundColor: T.bgDeep, color: T.txt }}
          className="w-full h-screen flex flex-col"
        >
          {/* Header */}
          <div
            style={{ borderColor: T.border, backgroundColor: T.bgCard }}
            className="border-b p-4"
          >
            <h1 className="text-xl font-bold">Messages</h1>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{ backgroundColor: T.bgCard, color: T.txt }}
              className="mx-4 mt-4 p-3 rounded-lg border flex items-gap-2 gap-2"
              style={{ borderColor: T.border }}
            >
              <AlertCircle size={16} style={{ color: T.warm }} className="flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="p-4">
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
                style={{ color: T.txt, backgroundColor: T.bgElev }}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader size={32} style={{ color: T.txtM }} className="animate-spin mb-3" />
                <p style={{ color: T.txt2 }} className="text-sm">
                  Loading conversations...
                </p>
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
                  isMobile
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare size={32} style={{ color: T.txtM }} />
                <p style={{ color: T.txt2 }} className="text-sm mt-2">
                  No conversations found
                </p>
              </div>
            )}
          </div>

          {/* New message button */}
          <div className="p-4 border-t" style={{ borderColor: T.border }}>
            <button
              onClick={() => setShowNewMessageModal(true)}
              style={{ backgroundColor: T.warm, color: T.bgDeep }}
              className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus size={18} />
              New Message
            </button>
          </div>

          {/* New message modal */}
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
        style={{ backgroundColor: T.bgDeep, color: T.txt }}
        className="w-full h-screen flex flex-col"
      >
        {/* Header */}
        <div
          style={{ borderColor: T.border, backgroundColor: T.bgCard }}
          className="border-b p-4 flex items-center gap-3"
        >
          <button
            onClick={() => setShowMobileList(true)}
            className="hover:opacity-70 transition-opacity"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>
          {selectedConversation && (
            <>
              <img
                src={selectedConversation.other_user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.other_user.username}&backgroundColor=random`}
                alt={selectedConversation.other_user.username}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.other_user.username}&backgroundColor=random`;
                }}
              />
              <div className="flex-1">
                <h2 className="font-bold text-sm">
                  {selectedConversation.other_user.username}
                </h2>
                <p style={{ color: T.txt2 }} className="text-xs">
                  Online
                </p>
              </div>
            </>
          )}
          <button className="hover:opacity-70 transition-opacity" aria-label="More options">
            <MoreVertical size={18} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{ backgroundColor: T.bgCard, color: T.txt }}
            className="mx-4 mt-4 p-3 rounded-lg border flex items-center gap-2"
            style={{ borderColor: T.border }}
          >
            <AlertCircle size={16} style={{ color: T.warm }} className="flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader size={32} style={{ color: T.txtM }} className="animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUserId={user?.id}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare size={32} style={{ color: T.txtM }} />
              <p style={{ color: T.txt2 }} className="text-sm mt-2">
                No messages yet. Say hello!
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{ borderColor: T.border, backgroundColor: T.bgCard }}
          className="border-t p-4"
        >
          <div
            style={{ borderColor: T.border, backgroundColor: T.bgElev }}
            className="border rounded-lg flex items-end gap-2 px-3 py-2"
          >
            <button className="hover:opacity-70 transition-opacity" aria-label="Attach file">
              <Paperclip size={18} style={{ color: T.txt2 }} />
            </button>
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              style={{ color: T.txt, backgroundColor: T.bgElev }}
              className="flex-1 outline-none text-sm resize-none max-h-20"
              rows="1"
              disabled={isSendingMessage}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSendingMessage}
              style={{
                color: messageInput.trim() && !isSendingMessage ? T.warm : T.txtM,
              }}
              className="hover:opacity-70 transition-opacity disabled:opacity-50 flex-shrink-0"
              aria-label="Send message"
            >
              {isSendingMessage ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: split view
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .messaging-left-panel { width: 100% !important; }
          .messaging-right-panel { display: none !important; }
          .messaging-left-panel.hidden { display: none !important; }
          .messaging-right-panel.visible { display: flex !important; width: 100% !important; }
        }
      `}</style>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            color: T.txt,
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          {toast}
        </div>
      )}
      <div
        style={{ backgroundColor: T.bgDeep, color: T.txt }}
        className="w-full h-screen flex"
      >
        {/* Left panel - Conversations list */}
        <div
          style={{
            width: isMobileView && selectedConversation ? "0px" : "300px",
            borderColor: T.border,
            backgroundColor: T.bgCard,
            display: isMobileView && selectedConversation ? "none" : "flex",
            transition: "all 0.3s ease"
          }}
          className="border-r flex flex-col h-screen messaging-left-panel"
        >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: T.border }}>
          <h1 className="text-xl font-bold mb-4">Messages</h1>

          {/* Search */}
          <div
            style={{ borderColor: T.border, backgroundColor: T.bgElev }}
            className="border rounded-lg flex items-center px-3 py-2 gap-2"
          >
            <Search size={16} style={{ color: T.txtM }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ color: T.txt, backgroundColor: T.bgElev }}
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{ backgroundColor: T.bgCard, color: T.txt }}
            className="mx-4 mt-4 p-3 rounded-lg border flex items-center gap-2"
            style={{ borderColor: T.border }}
          >
            <AlertCircle size={16} style={{ color: T.warm }} className="flex-shrink-0" />
            <p className="text-sm flex-1">{error}</p>
          </div>
        )}

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader size={32} style={{ color: T.txtM }} className="animate-spin mb-3" />
              <p style={{ color: T.txt2 }} className="text-sm">
                Loading conversations...
              </p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.thread_id}
                conversation={conv}
                isActive={selectedConversation?.thread_id === conv.thread_id}
                onClick={() => setSelectedConversation(conv)}
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

        {/* New message button */}
        <div className="p-4 border-t" style={{ borderColor: T.border }}>
          <button
            onClick={() => setShowNewMessageModal(true)}
            style={{ backgroundColor: T.warm, color: T.bgDeep }}
            className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={isCreatingNewConversation}
          >
            {isCreatingNewConversation ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            New Message
          </button>
        </div>

        {/* New message modal */}
        <NewMessageModal
          isOpen={showNewMessageModal}
          onClose={() => setShowNewMessageModal(false)}
          onSendMessage={handleNewMessage}
          isLoading={isCreatingNewConversation}
        />
      </div>

        {/* Right panel - Active conversation */}
        <div
          className="flex-1 flex flex-col h-screen messaging-right-panel"
          style={{ display: isMobileView && !selectedConversation ? "none" : "flex" }}
        >
          {selectedConversation ? (
            <>
              {/* Header */}
              <div
                style={{ borderColor: T.border, backgroundColor: T.bgCard }}
                className="border-b p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {isMobileView && (
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ backgroundColor: T.bgElev, display: "flex", alignItems: "center", justifyContent: "center" }}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <div className="relative">
                    <img
                      src={selectedConversation.other_user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.other_user.username}&backgroundColor=random`}
                      alt={selectedConversation.other_user.username}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.other_user.username}&backgroundColor=random`;
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="font-bold">
                      {selectedConversation.other_user.username}
                    </h2>
                    <p style={{ color: T.txt2 }} className="text-xs">
                      Online now
                    </p>
                  </div>
                </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePhoneCall}
                  className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                  style={{ backgroundColor: T.bgElev }}
                  aria-label="Phone call"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={handleVideoCall}
                  className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                  style={{ backgroundColor: T.bgElev }}
                  aria-label="Video call"
                >
                  <Video size={18} />
                </button>
                <button
                  className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                  style={{ backgroundColor: T.bgElev }}
                  aria-label="More options"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{ backgroundColor: T.bgCard, color: T.txt }}
                className="mx-6 mt-4 p-3 rounded-lg border flex items-center gap-2"
                style={{ borderColor: T.border }}
              >
                <AlertCircle size={16} style={{ color: T.warm }} className="flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{ backgroundColor: T.bgDeep }}
            >
              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader size={32} style={{ color: T.txtM }} className="animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message, index) => {
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showDateSeparator =
                    !prevMessage ||
                    getDateSeparator(new Date(prevMessage.created_at)) !==
                      getDateSeparator(new Date(message.created_at));

                  return (
                    <div key={message.id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <p style={{ color: T.txtM }} className="text-xs">
                            {getDateSeparator(new Date(message.created_at))}
                          </p>
                        </div>
                      )}
                      <MessageBubble
                        message={message}
                        currentUserId={user?.id}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <MessageSquare size={48} style={{ color: T.txtM }} />
                  <p style={{ color: T.txt2 }} className="text-sm mt-4">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              style={{ borderColor: T.border, backgroundColor: T.bgCard }}
              className="border-t p-4"
            >
              <div
                style={{ borderColor: T.border, backgroundColor: T.bgElev }}
                className="border rounded-lg flex items-end gap-2 px-3 py-3"
              >
                <button className="hover:opacity-70 transition-opacity flex-shrink-0" aria-label="Attach file">
                  <Paperclip size={18} style={{ color: T.txt2 }} />
                </button>
                <button className="hover:opacity-70 transition-opacity flex-shrink-0" aria-label="Attach image">
                  <Image size={18} style={{ color: T.txt2 }} />
                </button>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  style={{ color: T.txt, backgroundColor: T.bgElev }}
                  className="flex-1 outline-none text-sm resize-none max-h-24"
                  rows="1"
                  disabled={isSendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSendingMessage}
                  style={{
                    color: messageInput.trim() && !isSendingMessage ? T.warm : T.txtM,
                  }}
                  className="hover:opacity-70 transition-opacity disabled:opacity-50 flex-shrink-0"
                  aria-label="Send message"
                >
                  {isSendingMessage ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty state
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
      </div>
    </>
  );
}
