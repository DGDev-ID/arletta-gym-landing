declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module 'qrcode-vue' {
  import type { DefineComponent } from 'vue'
  const QrcodeVue: DefineComponent<{
    value: string
    size?: number
    level?: string
    background?: string
    foreground?: string
    renderAs?: string
  }>
  export default QrcodeVue
}
