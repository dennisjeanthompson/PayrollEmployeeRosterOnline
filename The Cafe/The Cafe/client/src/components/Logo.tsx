import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface LogoProps extends BoxProps {
  size?: number | string;
}

export default function Logo({ size = 40, ...props }: LogoProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 300 300"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <clipPath id="bowl">
          <rect x="115" y="54" width="200" height="180"/>
        </clipPath>
      </defs>
      <rect width="300" height="300" rx="64" fill="#0B1829"/>
      <rect x="86" y="66" width="32" height="168" rx="16" fill="#F0A821"/>
      <circle cx="150" cy="120" r="56" fill="#F0A821" clipPath="url(#bowl)"/>
      <rect x="90" y="94"  width="114" height="16" fill="#0B1829"/>
      <rect x="90" y="123" width="114" height="16" fill="#0B1829"/>
    </Box>
  );
}
