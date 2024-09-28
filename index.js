import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequilizeStore from 'connect-session-sequelize';
import ProductRoute from './routes/ProductRoute.js';
import UserRoute from './routes/UserRoute.js';
import AuthRoute from './routes/AuthRoute.js';

dotenv.config();
const app = express();
const sessionStore = SequilizeStore(session.Store);
const store = new sessionStore({
    db: db
});

// Database connection check
(async() => {
    try {
        await db.authenticate();
        console.log('Database connected...');
    } catch (error) {
        console.error('Database connection error:', error);
    }
})();
// (async() => {
// await db.sync();
// })();

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}))

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
}));

app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(ProductRoute);
app.use(UserRoute);
app.use(AuthRoute);

export default app;
// store.sync();

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.APP_PORT || 5000;
    app.listen(process.env.APP_PORT, () => {
        console.log(`Server running on port ${process.env.APP_PORT}`);
    });
}
