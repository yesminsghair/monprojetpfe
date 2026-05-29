// src/composables/useEcho.js
// ─────────────────────────────────────────────────────────────
// Shared Echo composable — wraps your existing echo.js so any
// component can subscribe to real-time events in one line and
// the channel is automatically left when the component unmounts.
//
// Your echo.js already sets up window.Echo with Reverb.
// This composable just makes it easy to use in Vue components.
//
// USAGE in a component:
//   import { useEcho } from '@/composables/useEcho'
//
//   // In mounted() or setup():
//   useEcho(
//     `notifications.${this.currentUser.id}`,  // channel name
//     '.NotificationCreated',                   // event name
//     (data) => { this.notifications.push(data) } // handler
//   )
//
//   // Multiple events on same channel:
//   const { listen } = useEcho(`chat.${roomId}`)
//   listen('.MessageSent',   (data) => { ... })
//   listen('.MessageDeleted',(data) => { ... })
//
// The composable automatically calls window.Echo.leave() when
// the component is destroyed — no manual cleanup needed.
// ─────────────────────────────────────────────────────────────

import { onUnmounted, getCurrentInstance } from 'vue'

export function useEcho (channelName, eventName = null, handler = null) {
  if (!window.Echo) {
    console.warn('[useEcho] window.Echo is not initialised. Make sure echo.js is imported in main.js.')
    return { listen: () => {}, leave: () => {} }
  }

  const channel = window.Echo.channel(channelName)

  // If event + handler are provided immediately, subscribe now
  if (eventName && handler) {
    channel.listen(eventName, handler)
  }

  // listen() lets you attach more events on the same channel
  function listen (event, cb) {
    channel.listen(event, cb)
  }

  // Auto-leave when the component that called this is destroyed
  // getCurrentInstance() returns null outside of setup() — safe to check
  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => {
      window.Echo.leave(channelName)
    })
  }

  // Manual leave — for Options API components that call this in mounted()
  function leave () {
    window.Echo.leave(channelName)
  }

  return { channel, listen, leave }
}