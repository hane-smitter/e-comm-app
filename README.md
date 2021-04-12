# E-comm-proj project

E-comm-proj is a project I built from scratch to serve as an online store to sell products specifically shoes in the internet scope.<br>
*[Click here](https://mmusify.herokuapp.com)* to see live version of the app.<br>

## Getting started
NB: You need node.js and npm(node package manager) installed on your machine to run this project. You can download these at [node download](https://nodejs.org/en/download/). Npm comes bundled together with node.

- Clone the repository
```
git clone  https://github.com/hane-smitter/e-comm-proj.git
```

- Enter into the root of the project directory
```
cd e-comm-proj
```
- Configure the app with some configurations.
- Create folder **config**
```

mkdir config
cd config
touch config.env-cmdrc
```
- These are the environment variables required in config.env-cmdrc
- *These env variables are stored in format of json object, as shown below:*

```
{
    "development": {
        "PORT": *value*,
        "MONGO_URL": *value*,
        "SESSION_SECRET": *value*,
        "GOOGLE_CLIENT_ID": *value*,
        "GOOGLE_CLIENT_SECRET": *value*,
        "NODE_ENV": "development",
        "STRIPE_PUB_KEY": *value*,
        "STRIPE_PRIV_KEY": *value*,
        "MPESA_CONSUMER_KEY": *value*,
        "MPESA_CONSUMER_SECRET_KEY": *value*,
        "LIPA_NA_MPESA_ONLINE_PASSKEY": *value*,
        "LIPA_NA_MPESA_CB_URL": *value*
    }
    "production": {
        "PORT": *value*,
        "MONGO_URL": *value*,
        "SESSION_SECRET": *value*,
        "GOOGLE_CLIENT_ID": *value*,
        "GOOGLE_CLIENT_SECRET": *value*,
        "NODE_ENV": "development",
        "STRIPE_PUB_KEY": *value*,
        "STRIPE_PRIV_KEY": *value*,
        "MPESA_CONSUMER_KEY": *value*,
        "MPESA_CONSUMER_SECRET_KEY": *value*,
        "LIPA_NA_MPESA_ONLINE_PASSKEY": *value*,
        "LIPA_NA_MPESA_CB_URL": *value*
    }
}
```

| Name                          | Description                         | Default Value                                  |
| ----------------------------- | ------------------------------------ | ----------------------------------------------- |
| PORT           | Port where th app is listening           | 3000      |
| SESSION_SECRET     | App uses session for creating stateful http requests and the session needs this value to be signed. | *No Default* |
| GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET     | Google [cloud console](https://console.cloud.google.com) API keys for creating the functionality of signing in using your google account | *No Default* |
| MONGODB_URL     | Connection URL to your Mongodb database. If you are using mongodb installed locally, mostly will be something like: *mongodb://127.0.0.1:27017/task-manager-api* | *No Default* |
| MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET_KEY, LIPA_NA_MPESA_ONLINE_PASSKEY     | API keys provided by (safaricom)[https://developer.safaricom.co.ke] for functionality of payment using M-PESA services. In the safaricom developer portal, get the api keys for LIPA NA MPESA and CONSUMER. A test paybill number is provided | *No Default* |
| LIPA_NA_MPESA_CB_URL     | This is the callback url that safaricom will call to provide information of the payment that has taken place. | *No Default* |
| STRIPE_PUB_KEY, STRIPE_PRIV_KEY     | API keys provided by (stripe)[https://stripe.com] to enable financial services in the application. | *No Default* |
| NODE_ENV           | Environment that your application is running in. Environment is chosen by starting the application using different commands. See below on how to start application in production and development modes.          |  *No Default*      |

- Get back to the root of the project
```
cd ..
```
- Install dependencies
```
npm install
```
- Build and run the project
```
npm start
```
- Build and run the project in development mode
```
npm run dev
```
- Build and run the project in production mode
```
npm run prod
```

Navigate to `http://localhost:3000/`.<br>
Authenticated routes require you to attach a bearer JWT token.


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.