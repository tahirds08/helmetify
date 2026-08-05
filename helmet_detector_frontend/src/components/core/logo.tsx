'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';

const HEIGHT = 60;
const WIDTH = 60;

type Color = 'dark' | 'light';

export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function Logo({ color = 'dark', emblem, height = HEIGHT, width = WIDTH }: LogoProps): React.JSX.Element {
  const foreground = color === 'light' ? '#F8FAFC' : '#0F172A';
  const accent = color === 'light' ? '#5EEAD4' : '#0F9E90';
  const viewWidth = emblem ? 64 : 230;

  return (
    <Box aria-label="Helmetify" component="svg" height={height} role="img" viewBox={`0 0 ${viewWidth} 64`} width={width} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="helmetify-logo-gradient" x1="10" x2="55" y1="8" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor={accent} />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <path d="M32 5C17.4 5 7 16.2 7 30.8V43c0 3.9 3.1 7 7 7h8v-9H16V30.8C16 21.1 23.2 14 32 14s16 7.1 16 16.8V41H35v9h15c3.9 0 7-3.1 7-7V30.8C57 16.2 46.6 5 32 5Z" fill="url(#helmetify-logo-gradient)" />
      <path d="M22 42h20c3.3 0 6 2.7 6 6v2H16v-2c0-3.3 2.7-6 6-6Z" fill={foreground} opacity="0.9" />
      <circle cx="32" cy="26" r="4" fill="#FFF" opacity="0.95" />
      {!emblem ? <text fill={foreground} fontFamily="Plus Jakarta Sans, Inter, sans-serif" fontSize="30" fontWeight="700" letterSpacing="-1" x="76" y="40">Helmetify</text> : null}
    </Box>
  );
}

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

