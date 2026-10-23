/// <reference types="vite/client" />

declare module '*.PNG' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.JPG' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

/** ISO date of the last build, injected by vite.config.ts */
declare const __BUILD_DATE__: string;
