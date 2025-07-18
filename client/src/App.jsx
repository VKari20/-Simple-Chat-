import { useState, useEffect, useRef } from 'react';
import { useSocket } from './socket/socket';
import { ToastContainer, toast } from 'react-toastify';
import { DarkModeToggle } from './components/DarkModeToggle';
import { EmojiSelector } from './components/EmojiPicker';
import 'react-toastify/dist/ReactToastify.css';
import './app.css';

function App() {
  const [usernameInput, setUsernameInput] = useState('');
  const [input, setInput] = useState('');
  const [privateReceiver, setPrivateReceiver] = useState('');
  const [joined, setJoined] = useState(false);
  const chatEndRef = useRef(null);

  const {
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    isConnected,
  } = useSocket();

  // Join chat
  const handleJoin = () => {
    if (usernameInput.trim() !== '') {
      connect(usernameInput.trim());
      setJoined(true);
    }
  };

  // Typing handler
  const handleTyping = (e) => {
    setInput(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  // Send message
  const handleSend = () => {
    if (!input.trim()) return;
    if (privateReceiver.trim()) {
      sendPrivateMessage(privateReceiver, input);
    } else {
      sendMessage(input);
    }
    setInput('');
    setTyping(false);
  };

  // Image Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;
      const imgTag = `<img src="${base64Image}" alt="upload" style="max-width:200px;" />`;
      sendMessage(imgTag);
    };
    reader.readAsDataURL(file);
  };

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (messages.length > 0) {
      const latest = messages[messages.length - 1];
      if (!latest.system) {
        toast.info(`💬 ${latest.sender}: ${latest.message}`, { autoClose: 3000 });
      }
    }
  }, [messages]);

  // Disconnect on unmount
  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>💬 Real-Time Socket.io Chat</h1>
        <DarkModeToggle />
      </header>
      <p style={{ marginTop: 0, color: '#666' }}>
        A real-time chat app built with React and Socket.io. Features include private messaging, typing indicators, file sharing, and more!
      </p>

      {!joined ? (
        <div>
          <h3>Enter your name</h3>
          <input
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Username"
            style={{ padding: 10 }}
          />
          <button onClick={handleJoin} style={{ marginLeft: 10 }}>Join Chat</button>
        </div>
      ) : (
        <>
          <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>

          <div style={{ display: 'flex', gap: 20 }}>
            {/* Sidebar */}
            <div style={{ width: '25%' }}>
              <h3>Online Users</h3>
              <ul>
                {users.map((user) => (
                  <li key={user.id}>
                    {user.username}
                    <button
                      style={{ marginLeft: 10 }}
                      onClick={() => setPrivateReceiver(user.id)}
                    >
                      PM
                    </button>
                  </li>
                ))}
              </ul>
              {privateReceiver && (
                <div>
                  <strong>Chatting privately with: {privateReceiver}</strong>{' '}
                  <button onClick={() => setPrivateReceiver('')}>Cancel</button>
                </div>
              )}
              {typingUsers.length > 0 && (
                <p>💬 {typingUsers.join(', ')} typing...</p>
              )}
            </div>

            {/* Chat Window */}
            <div style={{ flexGrow: 1 }}>
              <div
                style={{
                  border: '1px solid #ccc',
                  height: 400,
                  overflowY: 'scroll',
                  padding: 10,
                  background: '#f9f9f9',
                }}
              >
                {messages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: 10 }}>
                    {msg.system ? (
                      <em style={{ color: '#888' }}>{msg.message}</em>
                    ) : (
                      <div>
                        <strong>{msg.sender}</strong>:&nbsp;
                        <span dangerouslySetInnerHTML={{ __html: msg.message }} />
                        <small style={{ color: '#999' }}>
                          {' '}({new Date(msg.timestamp).toLocaleTimeString()})
                        </small>
                        {msg.isPrivate && <span style={{ color: 'red' }}> 🔒</span>}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Section */}
              <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                <input
                  value={input}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: 10 }}
                />
                <EmojiSelector onEmojiClick={(emoji) => setInput((prev) => prev + emoji)} />
                <input type="file" accept="image/*" onChange={handleFileUpload} />
                <button onClick={handleSend}>Send</button>
              </div>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
