// taskpilot-frontend/src/components/Auth/GoogleIcon.tsx
import React from 'react';

interface GoogleIconProps {
  className?: string;
}

const GoogleIcon: React.FC<GoogleIconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M44.5 24C44.5 22.38 44.34 20.78 44.02 19.2H24V28.5H35.34C34.72 31.84 32.84 34.68 30.12 36.52L30.08 36.8L37.76 42.6C42.66 38.08 45.5 31.32 45.5 24Z"
      fill="#4285F4"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 45.5C30.68 45.5 36.38 43.34 40.82 39.78L33.14 33.9C31.06 35.38 28.52 36.26 25.5 36.26C19.98 36.26 15.28 32.4 13.56 26.96L13.2 27.08L5.32 32.88C8.5 39.24 15.68 45.5 24 45.5Z"
      fill="#34A853"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.56 26.96C12.82 24.78 12.82 22.56 13.56 20.38L13.2 20.26L5.32 14.46C3.92 17.5 3.5 20.78 3.5 24C3.5 27.22 3.92 30.5 5.32 33.54L13.56 26.96Z"
      fill="#FBBC05"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M25.5 11.74C28.16 11.74 30.54 12.72 32.36 14.48L37.94 9.02C34.42 5.56 29.84 3.5 25.5 3.5C18.16 3.5 11.98 7.94 8.78 13.88L16.66 19.68C18.42 14.16 22.38 11.74 25.5 11.74Z"
      fill="#EA4335"
    />
  </svg>
);

export default GoogleIcon;