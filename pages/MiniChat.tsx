import React from 'react';

interface MiniChatProps {
  message?: string;
}

const MiniChat: React.FC<MiniChatProps> = ({ message }) => {
  return (
    <div style={{ padding: 12, background: '#f6f8fa', borderRadius: 8, margin: '12px 0', fontSize: 14 }}>
      {message || 'チャットメッセージをここに表示'}
    </div>
  );
};

export default MiniChat;
