import React, { FC } from 'react';
import './Code.css';

export const CodeRenderer: FC = ({ children }) => {
  return (
    <span className="Code">{children}</span>
  )
}

export default CodeRenderer;
