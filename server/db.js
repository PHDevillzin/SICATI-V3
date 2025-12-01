import { Sequelize, DataTypes } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      protocol: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    })
  : new Sequelize({
      dialect: "sqlite",
      storage: path.join(__dirname, "database.sqlite"),
      logging: false,
    });

const Company = sequelize.define("Company", {
  name: { type: DataTypes.STRING, allowNull: false },
  cnpj: { type: DataTypes.STRING, allowNull: false, unique: true },
});

const Contract = sequelize.define("Contract", {
  numeroContrato: { type: DataTypes.STRING },
  dataInicio: { type: DataTypes.STRING },
  dataEncerramento: { type: DataTypes.STRING },
  psda: { type: DataTypes.STRING },
  serviceProvided: { type: DataTypes.JSON }, // Store array as JSON
  status: { type: DataTypes.STRING },
});

// Relationship: Company has many Contracts
Company.hasMany(Contract, { as: "contracts" });
Contract.belongsTo(Company);

const ThirdParty = sequelize.define("ThirdParty", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING }, // Added email just in case, though not in original interface explicitly
  cpf: { type: DataTypes.STRING, unique: true },
  rg: { type: DataTypes.STRING },
  dataNascimento: { type: DataTypes.STRING },
  genero: { type: DataTypes.STRING },
  escolaridade: { type: DataTypes.STRING },
  cargo: { type: DataTypes.STRING },
  unidades: { type: DataTypes.JSON }, // Store array of strings as JSON
  entidade: { type: DataTypes.STRING },
  razaoSocial: { type: DataTypes.STRING }, // Denormalized for easier querying, or link to Company
  cnpj: { type: DataTypes.STRING }, // Denormalized
  endereco: { type: DataTypes.STRING },
  numero: { type: DataTypes.STRING },
  complemento: { type: DataTypes.STRING },
  bairro: { type: DataTypes.STRING },
  cidade: { type: DataTypes.STRING },
  estado: { type: DataTypes.STRING },
  uf: { type: DataTypes.STRING },
  cep: { type: DataTypes.STRING },
  pais: { type: DataTypes.STRING },
  telefone: { type: DataTypes.STRING },
  dataInicioVinculo: { type: DataTypes.STRING },
  dataInicioAtividades: { type: DataTypes.STRING },
  dataEncerramentoAtividades: { type: DataTypes.STRING },
  dataEncerramentoVinculo: { type: DataTypes.STRING },
  jornadaTrabalho: { type: DataTypes.STRING },
  recebeInsalubridade: { type: DataTypes.STRING },
  naturezaAdicional: { type: DataTypes.STRING },
  dataInicioInsalubridade: { type: DataTypes.STRING },
  dataTerminoInsalubridade: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  obsReferencia: { type: DataTypes.STRING },
});

const ThirdPartyHistory = sequelize.define("ThirdPartyHistory", {
  changeType: { type: DataTypes.STRING },
  previousData: { type: DataTypes.STRING },
  currentData: { type: DataTypes.STRING },
  snapshotBeforeChange: { type: DataTypes.JSON },
  changeDate: { type: DataTypes.STRING },
  responsible: { type: DataTypes.STRING },
});

// Relationship: ThirdParty has many History entries
ThirdParty.hasMany(ThirdPartyHistory, { as: "history" });
ThirdPartyHistory.belongsTo(ThirdParty);

const User = sequelize.define("User", {
  nif: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  unidade: { type: DataTypes.STRING }, // Comma separated or JSON? Let's use String for now as per frontend usage
  profile: { type: DataTypes.STRING },
  createdBy: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.STRING },
  lastEditedBy: { type: DataTypes.STRING },
  lastEditedAt: { type: DataTypes.STRING },
});

export { sequelize, Company, Contract, ThirdParty, ThirdPartyHistory, User };
