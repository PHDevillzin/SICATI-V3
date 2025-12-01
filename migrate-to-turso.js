import { sequelize, Company, Contract, ThirdParty, ThirdPartyHistory, User } from './server/db.js';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localDbPath = path.join(__dirname, 'server', 'database.sqlite');
console.log(`Reading from local DB: ${localDbPath}`);
// Native sqlite3 uses standard paths
const localDb = new sqlite3.Database(localDbPath);

function queryLocal(sql) {
    return new Promise((resolve, reject) => {
        localDb.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function migrate() {
    try {
        console.log('Authenticating with Turso...');
        await sequelize.authenticate();
        console.log('Connected to Turso.');

        console.log('Syncing schema to Turso (Force Reset)...');
        await sequelize.sync({ force: true }); 

        console.log('Migrating Companies...');
        const companies = await queryLocal('SELECT * FROM Companies');
        if (companies.length) await Company.bulkCreate(companies);
        console.log(`Migrated ${companies.length} Companies.`);

        console.log('Migrating Contracts...');
        const contracts = await queryLocal('SELECT * FROM Contracts');
        if (contracts.length) await Contract.bulkCreate(contracts);
        console.log(`Migrated ${contracts.length} Contracts.`);

        console.log('Migrating ThirdParties...');
        const thirdParties = await queryLocal('SELECT * FROM ThirdParties');
        if (thirdParties.length) await ThirdParty.bulkCreate(thirdParties);
        console.log(`Migrated ${thirdParties.length} ThirdParties.`);

        console.log('Migrating ThirdPartyHistories...');
        const histories = await queryLocal('SELECT * FROM ThirdPartyHistories');
        if (histories.length) await ThirdPartyHistory.bulkCreate(histories);
        console.log(`Migrated ${histories.length} Histories.`);

        console.log('Migrating Users...');
        const users = await queryLocal('SELECT * FROM Users');
        if (users.length) await User.bulkCreate(users);
        console.log(`Migrated ${users.length} Users.`);

        console.log('Migration successfully completed!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        localDb.close();
        await sequelize.close();
    }
}

migrate();
