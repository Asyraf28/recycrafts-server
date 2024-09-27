import { Sequelize } from "sequelize";

const db = new Sequelize('recycrafts_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

export default db;