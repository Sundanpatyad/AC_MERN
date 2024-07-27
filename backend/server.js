const express = require('express');
const cluster = require('cluster');
const os = require('os');
const path = require("path");

// packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

// connection to DB and cloudinary
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');
const mockRoutes = require("./routes/mocktest");

// middleware setup function
const setupMiddlewares = (app) => {
    app.use(express.json()); // to parse json body
    app.use(cookieParser());
    app.use(
        cors({
            // origin: 'http://localhost:5173', // frontend link
            origin: "*",
            credentials: true
        })
    );
    app.use(
        fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp'
        })
    );
};

// initialize express app function
const initExpressApp = () => {
    const app = express();
    setupMiddlewares(app);

    // mount routes
    app.use('/api/v1/auth', userRoutes);
    app.use('/api/v1/profile', profileRoutes);
    app.use('/api/v1/payment', paymentRoutes);
    app.use('/api/v1/course', courseRoutes);
    app.use('/api/v1/mock', mockRoutes);

    // Default Route
    app.get('/', (req, res) => {
        res.send(`<div>
            This is Default Route  
            <p>Everything is OK</p>
        </div>`);
    });

    return app;
};

const PORT = process.env.PORT || 5000;

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running`);
    console.log(`Forking ${numCPUs} workers...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log('Forking a new worker...');
        cluster.fork();
    });

    // connections
    connectDB();
    cloudinaryConnect();

} else {
    const app = initExpressApp();

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started, Server running on PORT ${PORT}`);
    });
}
