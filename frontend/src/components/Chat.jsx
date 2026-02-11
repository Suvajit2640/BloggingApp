import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

export function Chat() {
  const [socket, setSocket] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [error, setError] = useState("");
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  const selectedUserIdRef = useRef("");
  const typingTimeoutRef = useRef(null);

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return "";
    try {
      const [, payloadBase64] = token.split(".");
      const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadJson);
      return payload.user_id || "";
    } catch {
      return "";
    }
  }, []);

  const loadUsersAndRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to use chat.");
        return;
      }

      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [usersRes, requestsRes, blocksRes] = await Promise.all([
        axios.get(`${API_URL}/users`, authConfig),
        axios.get(`${API_URL}/friend-request`, authConfig),
        axios.get(`${API_URL}/block`, authConfig),
      ]);
      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }
      if (requestsRes.data.success) {
        setRequests(requestsRes.data.requests || []);
      }
      if (blocksRes.data.success) {
        const ids =
          (blocksRes.data.blocks || []).map((b) => b.blockedUserId?._id).filter(Boolean);
        setBlockedIds(ids);
      }
    } catch {
      setError("Failed to load users");
    }
  }, []);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    s.on("conversation_history", ({ messages: history }) => {
      setMessages(history || []);
    });

    s.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on("chat_error", (payload) => {
      setError(payload?.message || "Chat error");
    });

    s.on("friend_request_updated", () => {
      loadUsersAndRequests();
    });

    s.on("typing_status", ({ fromUserId, isTyping }) => {
      const activeId = selectedUserIdRef.current;
      if (String(fromUserId) === String(activeId)) {
        setIsFriendTyping(Boolean(isTyping));
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [loadUsersAndRequests]);

  useEffect(() => {
    loadUsersAndRequests();
  }, [loadUsersAndRequests]);

  const getFriendStatus = (userId) => {
    const req = requests.find(
      (r) =>
        (r.fromUserId._id === currentUserId && r.toUserId._id === userId) ||
        (r.fromUserId._id === userId && r.toUserId._id === currentUserId)
    );
    if (!req) return "none";
    if (req.status === "accepted") return "accepted";
    if (req.status === "pending") {
      return r.fromUserId._id === currentUserId ? "outgoing" : "incoming";
    }
    return "none";
  };

  const sendFriendRequest = async (toUserId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to send friend requests.");
        return;
      }
      await axios.post(
        `${API_URL}/friend-request`,
        { toUserId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadUsersAndRequests();
    } catch {
      setError("Failed to send friend request");
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to accept requests.");
        return;
      }
      await axios.patch(
        `${API_URL}/friend-request/${requestId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadUsersAndRequests();
    } catch {
      setError("Failed to accept friend request");
    }
  };

  const openConversation = (user) => {
    if (!socket) return;
    const otherUserId = user._id;
    setSelectedUserId(otherUserId);
    setMessages([]);
    setIsFriendTyping(false);
    socket.emit("join_conversation", { otherUserId });
    socket.emit("load_history", { otherUserId, limit: 50 });
  };

  const sendMessage = () => {
    if (!socket || !selectedUserId || !text.trim() || !currentUserId) return;
    const toUserId = selectedUserId;
    const payload = {
      toUserId,
      text,
      tempId: `${Date.now()}`,
    };

    socket.emit("send_message", payload);
    // stop typing once message is sent
    socket.emit("typing", { toUserId, isTyping: false });
    setText("");
  };

  const isMine = (m) =>
    String(m.fromUserId) === String(currentUserId) ||
    String(m.fromUserId?._id) === String(currentUserId);

  return (
    <div className="flex max-w-5xl mx-auto mt-8 p-4 bg-white shadow-lg rounded-xl h-[70vh]">
      <div className="w-1/3 border-r border-gray-200 pr-3 flex flex-col">
        <h1 className="text-xl font-bold mb-3 text-indigo-600">Friends</h1>
        <div className="flex-1 overflow-y-auto space-y-2">
          {users.map((u) => {
            const isBlocked = blockedIds.includes(u._id);
            const rel = requests.find(
              (r) =>
                (r.fromUserId._id === currentUserId &&
                  r.toUserId._id === u._id) ||
                (r.fromUserId._id === u._id &&
                  r.toUserId._id === currentUserId)
            );
            const status = rel ? rel.status : "none";
            const isIncoming =
              rel &&
              rel.status === "pending" &&
              rel.toUserId._id === currentUserId;

            return (
              <div
                key={u._id}
                className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer ${
                  selectedUserId === u._id ? "bg-indigo-50" : "hover:bg-gray-50"
                }`}
                onClick={() =>
                  status === "accepted" && !isBlocked
                    ? openConversation(u)
                    : undefined
                }
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-800">
                    {u.userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {u.userName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {status === "none" && !isBlocked && (
                    <button
                      className="text-xs px-2 py-1 rounded bg-indigo-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendFriendRequest(u._id);
                      }}
                    >
                      Add
                    </button>
                  )}
                  {status === "pending" && !isBlocked && isIncoming && rel && (
                    <button
                      className="text-xs px-2 py-1 rounded bg-green-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptFriendRequest(rel._id);
                      }}
                    >
                      Accept
                    </button>
                  )}
                  {status === "pending" && !isBlocked && !isIncoming && (
                    <span className="text-[11px] text-gray-400">
                      Requested
                    </span>
                  )}
                  {isBlocked && (
                    <span className="text-[11px] text-red-500">Blocked</span>
                  )}
                  {status === "accepted" && !isBlocked && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-green-600">Friend</span>
                      <button
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          (async () => {
                            try {
                              const token = localStorage.getItem("accessToken");
                              if (!token) return;
                              await axios.delete(`${API_URL}/friend/${u._id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              await loadUsersAndRequests();
                              if (selectedUserId === u._id) {
                                setSelectedUserId("");
                                setMessages([]);
                              }
                            } catch {
                              setError("Failed to remove friend");
                            }
                          })();
                        }}
                      >
                        Remove
                      </button>
                      <button
                        className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          (async () => {
                            try {
                              const token = localStorage.getItem("accessToken");
                              if (!token) return;
                              await axios.post(
                                `${API_URL}/block`,
                                { blockedUserId: u._id },
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );
                              await loadUsersAndRequests();
                              if (selectedUserId === u._id) {
                                setSelectedUserId("");
                                setMessages([]);
                              }
                            } catch {
                              setError("Failed to block user");
                            }
                          })();
                        }}
                      >
                        Block
                      </button>
                    </div>
                  )}
                  {isBlocked && (
                    <button
                      className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        (async () => {
                          try {
                            const token = localStorage.getItem("accessToken");
                            if (!token) return;
                            await axios.delete(`${API_URL}/block/${u._id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            await loadUsersAndRequests();
                          } catch {
                            setError("Failed to unblock user");
                          }
                        })();
                      }}
                    >
                      Unblock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="text-xs text-gray-400">No other users found.</p>
          )}
        </div>
      </div>

      <div className="flex-1 pl-3 flex flex-col">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          {selectedUserId
            ? "Conversation"
            : "Select a friend to start chatting"}
        </h2>
        {error && (
          <p className="text-xs text-red-500 mb-1 whitespace-pre-line">
            {error}
          </p>
        )}
        {isFriendTyping && (
          <div className="text-xs text-gray-500 mb-1 italic animate-pulse">
            Typing...
          </div>
        )}
        <div className="flex-1 border border-gray-200 rounded-lg p-3 overflow-y-auto mb-3 space-y-2">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm">
              {selectedUserId
                ? "No messages yet. Say hi!"
                : "Choose a friend from the left."}
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m._id || m.tempId}
                className={`flex ${isMine(m) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                    isMine(m)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="break-words">{m.text}</div>
                  <div className="mt-1 text-[10px] opacity-70">
                    {new Date(m.createdAt || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder={
              selectedUserId
                ? "Type a message..."
                : "Select a friend to start chatting"
            }
            value={text}
            onChange={(e) => {
              const value = e.target.value;
              setText(value);
              if (!socket || !selectedUserId) return;

              socket.emit("typing", { toUserId: selectedUserId, isTyping: true });

              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing", {
                  toUserId: selectedUserId,
                  isTyping: false,
                });
                typingTimeoutRef.current = null;
              }, 1000);
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={!selectedUserId}
          />
          <button
            onClick={sendMessage}
            disabled={!selectedUserId}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

