const mongoose = require('mongoose');

module.exports = (async() => {
    try {
        var conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log(`Mongoose connected: ${conn.connection.host}/${conn.connection.name}`)

    } catch (err) {
        console.log(err);
        process.exit(1);
    } 
})();