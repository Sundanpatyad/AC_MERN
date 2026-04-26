import React from 'react';

const HighlightText = ({ text }) => {
  return (
    <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
      {text}
    </span>
  );
}

export default HighlightText;
