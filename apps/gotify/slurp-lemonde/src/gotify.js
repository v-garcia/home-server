const got = require('got');

const gotifyNotification = (url, token) => (title, message, priority) => {
    console.info(message);
    return got.post(`${url}/message`, {
        headers: { 'X-Gotify-Key': token },
        json: {
            title: title,
            message: message,
            priority: priority || 1
        },
        retry: 3
    });
};


module.exports = gotifyNotification;