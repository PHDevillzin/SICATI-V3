
import express from 'express';
import cors from 'cors';
import { sequelize, Company, Contract, ThirdParty, ThirdPartyHistory, User } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

// --- Companies Endpoints ---
apiRouter.get('/companies', async (req, res) => {
    try {
        const companies = await Company.findAll({
            include: [{ model: Contract, as: 'contracts' }]
        });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.post('/companies', async (req, res) => {
    try {
        const { name, cnpj, contracts } = req.body;
        const company = await Company.create({ name, cnpj });
        
        if (contracts && contracts.length > 0) {
            for (const contract of contracts) {
                await Contract.create({ ...contract, CompanyId: company.id });
            }
        }
        
        const createdCompany = await Company.findByPk(company.id, {
             include: [{ model: Contract, as: 'contracts' }]
        });
        res.json(createdCompany);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.put('/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cnpj, contracts } = req.body;
        
        await Company.update({ name, cnpj }, { where: { id } });
        
        if (contracts && contracts.length > 0) {
            for (const contract of contracts) {
                if (contract.id) {
                    await Contract.update(
                        { status: contract.status, dataEncerramento: contract.dataEncerramento },
                        { where: { id: contract.id } }
                    );
                }
            }
        }
        
        const updatedCompany = await Company.findByPk(id, {
            include: [{ model: Contract, as: 'contracts' }]
        });
        res.json(updatedCompany);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.post('/contracts', async (req, res) => {
    try {
        const contract = await Contract.create(req.body);
        res.json(contract);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Third Parties Endpoints ---
apiRouter.get('/third-parties', async (req, res) => {
    try {
        const thirdParties = await ThirdParty.findAll({
            include: [{ model: ThirdPartyHistory, as: 'history' }]
        });
        res.json(thirdParties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.post('/third-parties', async (req, res) => {
    try {
        const { history, ...data } = req.body;
        const thirdParty = await ThirdParty.create(data);
        
        if (history && history.length > 0) {
            for (const h of history) {
                await ThirdPartyHistory.create({ ...h, ThirdPartyId: thirdParty.id });
            }
        }
        
        const createdTP = await ThirdParty.findByPk(thirdParty.id, {
            include: [{ model: ThirdPartyHistory, as: 'history' }]
        });
        res.json(createdTP);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.put('/third-parties/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { history, ...data } = req.body;
        
        await ThirdParty.update(data, { where: { id } });
        
        if (history && history.length > 0) {
             // Handle history updates if necessary
        }

        const updatedTP = await ThirdParty.findByPk(id, {
            include: [{ model: ThirdPartyHistory, as: 'history' }]
        });
        res.json(updatedTP);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Users Endpoints ---
apiRouter.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await User.update(req.body, { where: { id } });
        const updatedUser = await User.findByPk(id);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Units Endpoint ---
const unitData = {
    SESI: ["Agudos", "Alumínio", "Álvares Machado", "Americana", "Amparo", "Andradina", "Araçatuba", "Araraquara", "Araras", "Assis", "Avaré", "Bariri", "Barra Bonita", "Barretos", "Batatais", "Bauru", "Birigui", "Botucatu", "Bragança Paulista", "Campinas", "Cotia", "Cruzeiro", "Cubatão", "Diadema", "Guarulhos", "Indaiatuba", "Itapetininga", "Itu", "Jundiaí", "Lençóis Paulista", "Limeira", "Mauá", "Mogi Guaçu", "Osasco", "Piracicaba", "Presidente Epitácio", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Salto", "Santa Bárbara D'Oeste", "Santa Cruz do Rio Pardo", "Santa Rita do Passa Quatro", "Santana de Parnaíba", "Santo Anastácio", "Santo André", "Santos", "São Bernardo do Campo", "São Caetano do Sul", "São Carlos", "São João da Boa Vista", "São José do Rio Preto", "São José dos Campos", "SP - Belenzinho", "SP - Ipiranga", "SP - Tatuapé", "SP - Vila Bianca", "SP - Vila Císper", "SP - Vila Carrão", "SP - Vila das Mercês", "SP - Vila Espanhola", "SP - Vila Leopoldina", "SP - Lauzane Paulista", "SP - Cidade A.E. Carvalho", "São Roque", "Sertãozinho", "Suzano", "Taubaté"].map(u => `SESI - ${u}`),
    SENAI: ["Alumínio", "Araras", "Barra Bonita", "Barueri", "Bauru", "Campinas", "Cotia", "Cruzeiro", "Diadema", "Franco da Rocha", "Guarulhos", "Jandira", "Jundiaí", "Lençóis Paulista", "Limeira", "Mairinque", "Mogi das Cruzes", "Mogi Guaçu", "Osasco", "Piracicaba", "Pirassununga", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Santo André", "São Bernardo do Campo", "São Caetano do Sul", "São João da Boa Vista", "São José dos Campos", "SP - Barra Funda", "SP - Bom Retiro", "SP - Brás", "SP - Cambuci", "SP - Ipiranga", "SP - Leopoldina", "SP - Mooca", "SP - Pirituba", "SP - Santo Amaro", "SP - Vila Alpina", "SP - Vila Anastácio", "SP - Vila Mariana", "Sertãozinho", "Sorocaba", "Suzano", "Sumaré", "Tatuí", "Taubaté", "Valinhos", "Votuporanga"].map(u => `SENAI - ${u}`)
};

apiRouter.get('/units', (req, res) => {
    res.json(unitData);
});

app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
