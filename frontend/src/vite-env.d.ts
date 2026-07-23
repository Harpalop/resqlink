/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Public base URL the app is deployed at, used to build the Medical ID QR
   * code link (e.g. https://resqlink.vercel.app). When unset, the app falls
   * back to the current browser origin.
   */
  readonly VITE_PUBLIC_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
