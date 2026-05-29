import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

// Override the authorizer to prevent any auth requests
Pusher.Runtime.createXHR = function() {
    var xhr = new XMLHttpRequest();
    xhr.open = function(method, url, async) {
        // Block auth requests
        if (url.includes('/broadcasting/auth')) {
            return false;
        }
        return XMLHttpRequest.prototype.open.call(this, method, url, async);
    };
    return xhr;
};

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: 'uvs7qkafvkegkqlgoyev',
    wsHost: 'localhost',
    wsPort: 8080,
    scheme: 'http',
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: null,
    auth: {
        headers: {}
    },
    authorizer: (channel) => {
        return {
            authorize: (socketId, callback) => {
                callback(null, { auth: '' })
            }
        }
    }
})

export default window.Echo