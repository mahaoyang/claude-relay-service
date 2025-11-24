// Platform-specific form components
export { default as BedrockForm } from './BedrockForm.vue'
export { default as AzureOpenaiForm } from './AzureOpenaiForm.vue'
export { default as OpenaiResponsesForm } from './OpenaiResponsesForm.vue'
export { default as ClaudeConsoleForm } from './ClaudeConsoleForm.vue'

// Note: The following forms need to be created:
// - ClaudeOfficialForm.vue (Claude Code official accounts with OAuth/Setup Token)
// - GeminiForm.vue (Gemini accounts with OAuth)
// - DroidForm.vue (Droid accounts with OAuth or API Key)
// - CcrForm.vue (CCR accounts, similar to ClaudeConsoleForm)
