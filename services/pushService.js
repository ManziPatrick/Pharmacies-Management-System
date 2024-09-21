const webPush = require('web-push');

// VAPID keys generated from `web-push generate-vapid-keys`
webPush.setVapidDetails(
    'mailto:your-email@example.com', 
    process.env.PublicKey ||"BF777GXSK55Jx0wMQ1kXQeWZmsKKSjJOJujoXWxbITo-sxq6Rsj7ki2o5lEcmrkZNW4q9dAZOqebgulauEAtUK8", 
    process.env.PrivateKey ||"pkzXt-lMVbZpK4VTCSGkGYLBD6Zr40NM6-ungrcB1cU"
);

// Function to send notifications
const sendPushNotification = (subscription, data) => {
    webPush.sendNotification(subscription, JSON.stringify(data))
        .then(response => {
            console.log('Notification sent:', response);
        })
        .catch(error => {
            console.error('Error sending notification:', error);
        });
};

module.exports = { sendPushNotification };
