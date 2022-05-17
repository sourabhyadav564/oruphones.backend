const dotenv = require("dotenv");
dotenv.config();

const FCM = require("fcm-node");

const sendNotification = async (registration_token) => {
    let fcm = new FCM(process.env.FCM_KEY);
    let message = {
        to : registration_token,
        notification : {
            title : 'Want to sell your phone at best deal??',
            body : 'Download the ORU Phones app today and get the best market price of your phone with our complete verification.',
            sound : 'default',
            "click_action" : 'FCM_PLUGIN_ACTIVITY',
            "icon" : 'fcm_push_icon'
        }
    }
    fcm.send(message, function(err, response){
        if(err){
            console.log("Something has gone wrong!");
        }else{
            console.log("Successfully sent with response: ", response);
            return response;
        }
    })
}

module.exports = sendNotification;