import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export default function PesoIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 100 100">
      <text y="0.9em" x="0.1em" fontSize="90" fontFamily="Arial, sans-serif" fill="currentColor">₱</text>
    </SvgIcon>
  );
}
