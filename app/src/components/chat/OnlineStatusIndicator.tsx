import React from 'react';

const OnlineStatusIndicator: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  return (
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? 'green' : 'red' }} />
  );
};

export default OnlineStatusIndicator;
