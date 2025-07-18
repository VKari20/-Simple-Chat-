import EmojiPicker from 'emoji-picker-react'; // ✅ Correct default import
import { useState } from 'react';

export const EmojiSelector = ({ onEmojiClick }) => {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setShow((prev) => !prev)}>😀</button>

      {show && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
          top: '100%',
          left: 0
        }}>
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              onEmojiClick(emojiData.emoji);
              setShow(false); // Close after selection
            }}
            theme="light"
          />
        </div>
      )}
    </div>
  );
};
