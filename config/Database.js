import { Sequelize } from "sequelize";
import mysql2 from "mysql2"; 
import dotenv from "dotenv";

dotenv.config();
await sequelize.sync({ force: false });

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectModule: mysql2, 
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
    }
});

try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);



export default db;
