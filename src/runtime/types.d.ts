import type { Result } from 'html-validate'
import type { H3Event } from 'h3'
import type { RenderResponse } from 'nitropack'

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'html-validator:check': (result: { valid: boolean, results: Result[] }, response: Partial<RenderResponse>, context: {
      event: H3Event
    }) => void
  }
}
