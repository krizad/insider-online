declare module 'react-playing-card' {
  import * as React from 'react';
  const Card: React.FC<{
    rank: string;
    suit: string;
    back?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }>;
  export default Card;
}
