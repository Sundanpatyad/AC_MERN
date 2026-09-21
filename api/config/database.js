const mongoose = require('mongoose');
require('dotenv').config();

const { ensurePlayReviewer } = require('../utils/ensurePlayReviewer');


exports.connectDB = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(async () => {
            console.log('Database connected successfully');
            try {
                await ensurePlayReviewer();
            } catch (error) {
                console.error('[auth] Could not ensure Play reviewer account', error);
            }
        })
        .catch(error => {
            console.log('Error while connecting server with Database');
            console.log(error);
            process.exit(1);
        })
};
