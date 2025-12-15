/// <reference types="vite/client" />

declare module '@mui/icons-material' {
  const content: any;
  export default content;
  export * from '@mui/icons-material/index';
}

declare module '@mui/icons-material/*' {
  const content: any;
  export default content;
}
