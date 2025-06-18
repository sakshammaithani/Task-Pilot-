// src/components/TestComponent.tsx
import React from 'react';

interface TestProps {
  message: string;
}

const TestComponent: React.FC<TestProps> = ({ message }) => {
  return <p>{message}</p>;
};

export default TestComponent;