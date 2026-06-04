import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

// Public channels (Channel, not PrivateChannel) require no auth handshake.
// Keep this config clean — no XHR overrides or fake authorizers needed.
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: 'uvs7qkafvkegkqlgoyev',
    wsHost: 'localhost',
    wsPort: 8080,
    scheme: 'http',
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
})

export default window.Echo