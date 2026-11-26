/// <reference types="vite/client" />

// Relax unused variable errors to warnings only
declare module '*.svg' {
  const content: string;
  export default content;
}
