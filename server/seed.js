
import { sequelize, Company, Contract, ThirdParty, ThirdPartyHistory, User } from './db.js';

// --- Data Generation Logic (Ported from Frontend) ---

// --- Companies & Contracts ---
const services = ['Engenharia Civil', 'Paisagismo', 'Segurança Patrimonial', 'Limpeza e Conservação', 'Consultoria de TI', 'Manutenção Industrial', 'Transporte e Logística', 'Alimentação Industrial', 'Recursos Humanos', 'Marketing Digital', 'Consultoria Financeira', 'Serviços de Recepção', 'Manutenção de Elevadores', 'Controle de Pragas', 'Gestão de Resíduos'];

const generateCNPJ = (id) => {
    const n = () => Math.floor(Math.random() * 10);
    const idStr = String(id).padStart(4, '0');
    return `${String(id).padStart(2,'0')}.${idStr.slice(0,3)}.${idStr.slice(1,4)}/0001-${n()}${n()}`;
};

const generateDataInicio = (year) => {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

const generatePsda = (year) => {
    const num = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return `${num}/${String(year).slice(2)}`;
};

let contractIdCounter = 1;

const generateCompaniesAndContracts = (count) => {
    const companies = [];
    const companyNames = [
        "Alfa Engenharia", "Andrômeda Eventos", "Apex Systems", "Astro Construções Modulares",
        "Beta Soluções de TI", "Boreal Transportes Rápidos", "Brasileira de Serviços Gerais (BSG)",
        "Centauri Importação e Exportação", "Cometa Marketing Digital", "Construtora Vanguarda",
        "Delta Segurança Patrimonial", "Dínamo Manutenção Elétrica", "Dinâmica Engenharia de Projetos",
        "Eclipse Gestão de Frotas", "Eficaz Conservação Predial",
        "Fênix Manutenção", "Fortaleza Segurança Privada", "Fóton Energia Renovável",
        "Galáxia Telecomunicações", "Gama Logística Integrada", "Global-Tech Soluções",
        "Hidra Controle de Pragas", "Horizonte Terceirização",
        "Ícaro Soluções Aéreas", "Impacto Visual Comunicação",
        "Jato Limpo Saneamento", "Júpiter Têxtil",
        "Kadosh Alimentação Corporativa", "Krona Metalurgia",
        "Líder Manutenção e Reparos", "Lira Advocacia Empresarial",
        "Magna Recursos Humanos", "Máxima Eficiência Logística", "Meridian Solutions",
        "Nexus Tecnologia da Informação", "Nova Era Consultoria",
        "Ômega Alimentos Industriais", "Orion Vigilância Eletrônica",
        "Pégasus Entregas Expressas", "Pinnacle Corp", "Pioneira Serviços Industriais",
        "Qualitas Gestão Ambiental", "Quantum Desenvolvimento de Software",
        "Racional Construções", "Raio Gráfica e Editora",
        "Sigma Consultoria Financeira", "Sirius Auditoria Contábil", "Sólida Fundações", "Summit Enterprises",
        "Taurus Equipamentos Pesados", "Topázio Joalheria",
        "União Facilities", "Universo Paisagismo",
        "Vega Marketing", "Vértice Topografia",
        "Wega Automação Industrial",
        "Xylon Marcenaria",
        "Yield Investimentos",
        "Zênite Serviços de Limpeza", "Zodiac Brindes Corporativos"
    ];

    // Scenario 1
    companies.push({
        id: 1,
        name: 'Ápice Soluções em Limpeza Ltda.',
        cnpj: '12.345.678/0001-99',
        contracts: [
            { id: contractIdCounter++, numeroContrato: 'CT-2023-001', dataInicio: '15/01/2023', psda: '00123/23', serviceProvided: ['Limpeza e Conservação'], status: 'Ativo' }
        ]
    });
    
    // Scenario 2
    companies.push({
        id: 2,
        name: 'Elos Segurança e Vigilância S.A.',
        cnpj: '98.765.432/0001-11',
        contracts: [
            { id: contractIdCounter++, numeroContrato: 'CT-2023-002', dataInicio: '20/02/2023', psda: '00234/23', serviceProvided: ['Segurança Patrimonial'], status: 'Ativo' },
            { id: contractIdCounter++, numeroContrato: 'CT-2024-003', dataInicio: '10/05/2024', psda: '00345/24', serviceProvided: ['Vigilância Eletrônica'], status: 'Ativo' }
        ]
    });
    
    // Scenario 3
    companies.push({
        id: 3,
        name: 'Primordial Paisagismo e Jardinagem ME',
        cnpj: '11.222.333/0001-44',
        contracts: [
            { id: contractIdCounter++, numeroContrato: 'CT-2024-004', dataInicio: '01/03/2024', psda: '00456/24', serviceProvided: ['Paisagismo'], status: 'Ativo' },
            { id: contractIdCounter++, numeroContrato: 'CT-2022-005', dataInicio: '05/12/2022', dataEncerramento: '04/12/2023', psda: '00567/22', serviceProvided: ['Manutenção de Áreas Verdes'], status: 'Inativo' },
            { id: contractIdCounter++, numeroContrato: 'CT-2021-006', dataInicio: '30/06/2021', dataEncerramento: '29/06/2022', psda: '00678/21', serviceProvided: ['Controle de Pragas'], status: 'Inativo' }
        ]
    });

    const usedNames = new Set(companies.map(c => c.name));
    const availableNames = companyNames.filter(name => !usedNames.has(name));

    for (let i = 4; i <= count + 3; i++) {
        if (availableNames.length === 0) break;
        
        const nameIndex = (i - 4) % availableNames.length;
        const baseName = availableNames[nameIndex];
        
        const numContracts = Math.floor(Math.random() * 4) + 1;
        const contracts = [];
        let activeContracts = 0;

        for (let j = 0; j < numContracts; j++) {
            const year = 2022 + Math.floor(Math.random() * 3);
            const isFirstContract = j === 0;
            const status = isFirstContract || activeContracts === 0 ? 'Ativo' : (Math.random() > 0.4 ? 'Ativo' : 'Inativo');
            if (status === 'Ativo') activeContracts++;
            
            const dataInicio = generateDataInicio(year);
            let dataEncerramento = undefined;

            if (status === 'Inativo') {
                const [day, month, startYear] = dataInicio.split('/').map(Number);
                const startDate = new Date(startYear, month - 1, day);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 6 + Math.floor(Math.random() * 18));
                dataEncerramento = endDate.toLocaleDateString('pt-BR');
            }
            
            contracts.push({
                id: contractIdCounter++,
                numeroContrato: `CT-${year}-${String(i).padStart(3,'0')}-${j}`,
                dataInicio: dataInicio,
                dataEncerramento: dataEncerramento,
                psda: generatePsda(year),
                serviceProvided: [services[Math.floor(Math.random() * services.length)]],
                status: status,
            });
        }

        companies.push({
            id: i,
            name: `${baseName} ${i % 3 === 0 ? 'S.A.' : 'Ltda.'}`,
            cnpj: generateCNPJ(i),
            contracts: contracts
        });
        
        availableNames.splice(nameIndex, 1);
    }
    return companies;
};

const allCompanies = generateCompaniesAndContracts(50);

// --- Third Parties ---
const initialThirdPartiesData = [
  {
    id: 1,
    unidades: ['SESI - Campinas'],
    entidade: 'SESI',
    razaoSocial: 'Ápice Soluções em Limpeza Ltda.',
    cnpj: '12.345.678/0001-99',
    name: 'João da Silva',
    cpf: '123.456.789-00',
    escolaridade: 'Ensino Médio',
    genero: 'Masculino',
    endereco: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'Campinas',
    estado: 'São Paulo',
    uf: 'SP',
    cep: '13010-000',
    pais: 'Brasil',
    dataNascimento: '15/05/1988',
    cargo: 'Limpeza e Conservação',
    dataInicioVinculo: '01/02/2022',
    dataInicioAtividades: '10/02/2022',
    jornadaTrabalho: 'Jornada 44h Semanais',
    recebeInsalubridade: 'Sim',
    naturezaAdicional: 'Temporário',
    dataInicioInsalubridade: '01/03/2023',
    dataTerminoInsalubridade: '31/08/2024',
    status: 'Ativo',
    history: [
       { changeType: 'Criação', previousData: '-', currentData: 'Cadastro inicial do colaborador', snapshotBeforeChange: null, changeDate: '10/02/2022', responsible: 'Daniel' },
       { 
         changeType: 'Cargo', 
         previousData: 'Ajudante Geral', 
         currentData: 'Limpeza e Conservação', 
         snapshotBeforeChange: {
            id: 1,
            unidades: ['SESI - Campinas'],
            entidade: 'SESI',
            razaoSocial: 'Ápice Soluções em Limpeza Ltda.',
            cnpj: '12.345.678/0001-99',
            name: 'João da Silva',
            cpf: '123.456.789-00',
            escolaridade: 'Ensino Médio',
            genero: 'Masculino',
            endereco: 'Rua das Flores',
            numero: '123',
            bairro: 'Centro',
            cidade: 'Campinas',
            estado: 'São Paulo',
            uf: 'SP',
            cep: '13010-000',
            pais: 'Brasil',
            dataNascimento: '15/05/1988',
            cargo: 'Ajudante Geral',
            dataInicioVinculo: '01/02/2022',
            dataInicioAtividades: '10/02/2022',
            jornadaTrabalho: 'Jornada 44h Semanais',
            recebeInsalubridade: 'Sim',
            naturezaAdicional: 'Temporário',
            dataInicioInsalubridade: '01/03/2023',
            dataTerminoInsalubridade: '31/08/2024',
            status: 'Ativo',
         },
         changeDate: '15/09/2023', 
         responsible: 'Rafael' 
       },
    ]
  },
  {
    id: 2,
    unidades: ['SENAI - Sorocaba'],
    entidade: 'SENAI',
    razaoSocial: 'Primordial Paisagismo e Jardinagem ME',
    cnpj: '11.222.333/0001-44',
    name: 'Maria Oliveira',
    cpf: '987.654.321-11',
    escolaridade: 'Ensino Superior',
    genero: 'Feminino',
    endereco: 'Avenida Principal',
    numero: '456',
    bairro: 'Centro',
    cidade: 'Sorocaba',
    estado: 'São Paulo',
    uf: 'SP',
    cep: '18010-000',
    pais: 'Brasil',
    dataNascimento: '20/11/1995',
    cargo: 'Paisagismo',
    dataInicioVinculo: '03/03/2023',
    dataInicioAtividades: '05/03/2023',
    jornadaTrabalho: 'Jornada Parcial',
    recebeInsalubridade: 'Não',
    status: 'Ativo',
    history: [
       { changeType: 'Criação', previousData: '-', currentData: 'Cadastro inicial do colaborador', snapshotBeforeChange: null, changeDate: '05/03/2023', responsible: 'Teste' }
    ]
  },
  {
    id: 3,
    unidades: ["SENAI - SP - Mooca"],
    entidade: 'SENAI',
    razaoSocial: 'Elos Segurança e Vigilância S.A.',
    cnpj: '98.765.432/0001-11',
    name: 'Pedro Santos',
    cpf: '111.222.333-44',
    escolaridade: 'Ensino Médio',
    genero: 'Masculino',
    endereco: 'Praça da Sé',
    numero: '789',
    bairro: 'Sé',
    cidade: 'São Paulo',
    estado: 'São Paulo',
    uf: 'SP',
    cep: '01001-000',
    pais: 'Brasil',
    dataNascimento: '30/01/1980',
    cargo: 'Segurança Patrimonial',
    dataInicioVinculo: '01/06/2021',
    dataInicioAtividades: '02/06/2021',
    dataEncerramentoAtividades: '18/04/2024',
    jornadaTrabalho: 'Jornada 12H36',
    recebeInsalubridade: 'Não',
    status: 'Inativo',
    history: [
       { changeType: 'Criação', previousData: '-', currentData: 'Cadastro inicial do colaborador', snapshotBeforeChange: null, changeDate: '02/06/2021', responsible: 'Daniel' },
       { 
         changeType: 'Encerramento das atividades na unidade.', 
         previousData: 'Ativo', 
         currentData: 'Inativo',
         snapshotBeforeChange: {
            id: 3,
            unidades: ["SENAI - SP - Mooca"],
            entidade: 'SENAI',
            razaoSocial: 'Elos Segurança e Vigilância S.A.',
            cnpj: '98.765.432/0001-11',
            name: 'Pedro Santos',
            cpf: '111.222.333-44',
            escolaridade: 'Ensino Médio',
            genero: 'Masculino',
            endereco: 'Praça da Sé',
            numero: '789',
            bairro: 'Sé',
            cidade: 'São Paulo',
            estado: 'São Paulo',
            uf: 'SP',
            cep: '01001-000',
            pais: 'Brasil',
            dataNascimento: '30/01/1980',
            cargo: 'Segurança Patrimonial',
            dataInicioVinculo: '01/06/2021',
            dataInicioAtividades: '02/06/2021',
            jornadaTrabalho: 'Jornada 12H36',
            recebeInsalubridade: 'Não',
            status: 'Ativo',
         },
         changeDate: '18/04/2024', 
         responsible: 'Paulo H. R. Silva' 
        }
    ]
  }
];

const unitData = {
    SESI: ["Agudos", "Alumínio", "Álvares Machado", "Americana", "Amparo", "Andradina", "Araçatuba", "Araraquara", "Araras", "Assis", "Avaré", "Bariri", "Barra Bonita", "Barretos", "Batatais", "Bauru", "Birigui", "Botucatu", "Bragança Paulista", "Campinas", "Cotia", "Cruzeiro", "Cubatão", "Diadema", "Guarulhos", "Indaiatuba", "Itapetininga", "Itu", "Jundíai", "Lençóis Paulista", "Limeira", "Mauá", "Mogi Guaçu", "Osasco", "Piracicaba", "Presidente Epitácio", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Salto", "Santa Bárbara D'Oeste", "Santa Cruz do Rio Pardo", "Santa Rita do Passa Quatro", "Santana de Parnaíba", "Santo Anastácio", "Santo André", "Santos", "São Bernardo do Campo", "São Caetano do Sul", "São Carlos", "São João da Boa Vista", "São José do Rio Preto", "São José dos Campos", "SP - Belenzinho", "SP - Ipiranga", "SP - Tatuapé", "SP - Vila Bianca", "SP - Vila Císper", "SP - Vila Carrão", "SP - Vila das Mercês", "SP - Vila Espanhola", "SP - Vila Leopoldina", "SP - Lauzane Paulista", "SP - Cidade A.E. Carvalho", "São Roque", "Sertãozinho", "Suzano", "Taubaté"].map(u => `SESI - ${u}`),
    SENAI: ["Alumínio", "Araras", "Barra Bonita", "Barueri", "Bauru", "Campinas", "Cotia", "Cruzeiro", "Diadema", "Franco da Rocha", "Guarulhos", "Jandira", "Jundíai", "Lençóis Paulista", "Limeira", "Mairinque", "Mogi das Cruzes", "Mogi Guaçu", "Osasco", "Piracicaba", "Pirassununga", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Santo André", "São Bernardo do Campo", "São Caetano do Sul", "São João da Boa Vista", "São José dos Campos", "SP - Barra Funda", "SP - Bom Retiro", "SP - Brás", "SP - Cambuci", "SP - Ipiranga", "SP - Leopoldina", "SP - Mooca", "SP - Pirituba", "SP - Santo Amaro", "SP - Vila Alpina", "SP - Vila Anastácio", "SP - Vila Mariana", "Sertãozinho", "Sorocaba", "Suzano", "Sumaré", "Tatuí", "Taubaté", "Valinhos", "Votuporanga"].map(u => `SENAI - ${u}`)
};
const allUnits = [...unitData.SESI, ...unitData.SENAI];
const escolaridadeOptions = ['Não Informado', 'Ensino Fundamental', 'Ensino Médio', 'Ensino Superior', 'Pós-Graduação'];
const generoOptions = ['Não Informado', 'Masculino', 'Feminino', 'Outros'];
const jornadaOptions = ['Jornada 44h Semanais', 'Jornada 12H36', 'Jornada Parcial'];
const cargos = [
    'Limpeza',
    'Portaria',
    'Jardinagem',
    'Vigilância e seg. patrimonial',
    'Vigia escolar',
].sort();
const responsibles = ['Daniel', 'Rafael', 'Teste', 'Paulo H. R. Silva'];

const generateUniqueCPF = (existingCPFs) => {
    let cpf = '';
    do {
      cpf = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
    } while (existingCPFs.has(cpf));
    existingCPFs.add(cpf);
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateNewCollaborators = (names, startingId) => {
    const newCollaborators = [];
    const existingCPFs = new Set(initialThirdPartiesData.map(c => c.cpf.replace(/\D/g, '')));

    names.forEach((name, index) => {
        const id = startingId + index;
        const company = getRandomItem(allCompanies);
        const dataNascimentoDate = getRandomDate(new Date(1970, 0, 1), new Date(2004, 11, 31));
        const dataInicioVinculoDate = getRandomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
        const dataInicioAtividadesDate = new Date(dataInicioVinculoDate);
        dataInicioAtividadesDate.setDate(dataInicioAtividadesDate.getDate() + Math.floor(Math.random() * 30));

        const recebeInsalubridade = Math.random() > 0.8 ? 'Sim' : 'Não';
        const naturezaAdicional = recebeInsalubridade === 'Sim' ? (Math.random() > 0.5 ? 'Temporário' : 'Definitivo') : undefined;
        let dataInicioInsalubridade = undefined;
        let dataTerminoInsalubridade = undefined;

        if (recebeInsalubridade === 'Sim') {
            const dataInicioIns = getRandomDate(new Date(dataInicioAtividadesDate), new Date());
            dataInicioInsalubridade = dataInicioIns.toLocaleDateString('pt-BR');
            if (naturezaAdicional === 'Temporário') {
                const dataTerminoIns = new Date(dataInicioIns);
                dataTerminoIns.setMonth(dataTerminoIns.getMonth() + 6 + Math.floor(Math.random() * 12));
                dataTerminoInsalubridade = dataTerminoIns.toLocaleDateString('pt-BR');
            }
        }

        const newCollaborator = {
            id,
            name,
            unidades: [getRandomItem(allUnits)],
            entidade: '',
            razaoSocial: company.name,
            cnpj: company.cnpj,
            cpf: generateUniqueCPF(existingCPFs),
            escolaridade: getRandomItem(escolaridadeOptions),
            genero: getRandomItem(generoOptions),
            endereco: `Rua Exemplo ${id}`,
            numero: `${id}`,
            bairro: 'Bairro Fictício',
            cidade: 'Cidade Fictícia',
            estado: 'São Paulo',
            uf: 'SP',
            cep: `${String(Math.floor(Math.random() * 90000) + 10000)}-000`,
            pais: 'Brasil',
            dataNascimento: dataNascimentoDate.toLocaleDateString('pt-BR'),
            cargo: getRandomItem(cargos),
            dataInicioVinculo: dataInicioVinculoDate.toLocaleDateString('pt-BR'),
            dataInicioAtividades: dataInicioAtividadesDate.toLocaleDateString('pt-BR'),
            jornadaTrabalho: getRandomItem(jornadaOptions),
            recebeInsalubridade,
            naturezaAdicional,
            dataInicioInsalubridade,
            dataTerminoInsalubridade,
            status: Math.random() > 0.15 ? 'Ativo' : 'Inativo',
            history: [{
                changeType: 'Criação',
                previousData: '-',
                currentData: 'Cadastro inicial do colaborador',
                snapshotBeforeChange: null,
                changeDate: dataInicioAtividadesDate.toLocaleDateString('pt-BR'),
                responsible: getRandomItem(responsibles)
            }]
        };

        newCollaborator.entidade = newCollaborator.unidades[0].startsWith('SESI') ? 'SESI' : 'SENAI';
        
        let lastChangeDate = new Date(dataInicioAtividadesDate);

        if (index % 2 === 0 && newCollaborator.history.length < 4) {
            const numberOfChanges = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numberOfChanges; i++) {
                const newChangeDate = getRandomDate(new Date(lastChangeDate.getTime() + 86400000 * 30), new Date());
                if(newChangeDate <= lastChangeDate) continue;
                lastChangeDate = newChangeDate;

                const changeType = getRandomItem(['Cargo', 'Unidade', 'Jornada de Trabalho']);
                let previousData = '';
                let currentData = '';
                
                const { history, ...snapshot } = newCollaborator;
                const snapshotBeforeChange = JSON.parse(JSON.stringify(snapshot));

                switch (changeType) {
                    case 'Cargo':
                        previousData = newCollaborator.cargo;
                        do { currentData = getRandomItem(cargos); } while (currentData === previousData);
                        newCollaborator.cargo = currentData;
                        break;
                    case 'Unidade':
                        previousData = newCollaborator.unidades[0];
                        do { currentData = getRandomItem(allUnits); } while (currentData === previousData);
                        newCollaborator.unidades = [currentData];
                        newCollaborator.entidade = currentData.startsWith('SESI') ? 'SESI' : 'SENAI';
                        break;
                    case 'Jornada de Trabalho':
                         previousData = newCollaborator.jornadaTrabalho;
                         do { currentData = getRandomItem(jornadaOptions); } while (currentData === previousData);
                        newCollaborator.jornadaTrabalho = currentData;
                        break;
                }

                newCollaborator.history.push({ changeType, previousData, currentData, snapshotBeforeChange, changeDate: lastChangeDate.toLocaleDateString('pt-BR'), responsible: getRandomItem(responsibles) });
            }
        }

        if (newCollaborator.status === 'Inativo') {
             const inactivationDate = getRandomDate(new Date(lastChangeDate.getTime() + 86400000), new Date());
             if (inactivationDate > lastChangeDate) {
                const { history, ...snapshot } = newCollaborator;
                const snapshotBeforeChange = JSON.parse(JSON.stringify(snapshot));

                newCollaborator.dataEncerramentoAtividades = inactivationDate.toLocaleDateString('pt-BR');
                newCollaborator.history.push({
                    changeType: 'Encerramento do contrato de trabalho.',
                    previousData: 'Ativo',
                    currentData: 'Inativo',
                    snapshotBeforeChange,
                    changeDate: inactivationDate.toLocaleDateString('pt-BR'),
                    responsible: getRandomItem(responsibles)
                });
             }
        }
        
        newCollaborators.push(newCollaborator);
    });

    return newCollaborators;
};

const newNames = [
    "Adna Joyce", "Agnelo M. Camapum", "Alberto Wilton Júlio César", "Alerrandro Guimaraes", "Aline Sharlon Ramos", "Amanda Dorneles", "Ana Laura", "Ana Paula Soares Fernandes Lamha", "Andréa Anchieta", "André Furtado", "Antônio Neto", "Bárbara Emanuelle", "Brenda Cruz Ribeiro", "Breno Soares", "Bruno Campêlo", "Carla Mendes", "Carlos Eduardo Borges da Silva", "Chris Coper", "Cíntya Raquel", "Cristiane Barros", "Dândara Nogueira", "David Ferreira", "Davison Bringhenti", "Dayse Fernanda Freitas", "Delryhane Carvalho", "Denyse Soares", "Diana Campos", "Douglas Junior", "Eclésia Kauana Lima", "Edjane Gonçalves", "Eduardo Garcia", "Eduardo Henrique", "Elane Carvalho", "Elton Álvares", "Elieth Bezerra", "Elioena Menezes Carreiro", "Eliúde De Paula Itskovich", "Elton De Carvalho", "Elton Martins", "Erik Moraes", "Eusiene Furtado Mota", "Evyla Farias", "Faelzinho Santos", "Fernaanda Vieiira", "Fernando Santos", "Filipe Adressa", "Gilmarcio Costa", "Gisa Souza", "Giseli Maria Rover", "Glelson Mendes", "Handson Lemos", "Hugo Costa", "Iara Lemos", "Itallo Dirceu", "Jéssica Marques", "Joselito Loiola", "Juan Pablo", "Juliana Ambrósio", "Kaila Waleska", "Karla Gomes Álvares Dias", "Kleidiane Martins", "Laianny Carvalho Varão", "Laís Silva", "Larysse Leal", "Lennise Portela", "Leonice Pacheco", "Leandro Sá", "Lícia Haickel Rosa", "Lid Alves", "Lilian Gerth", "Linda Jéssica", "Lívia Reis", "Lorena Nascimento", "Luanna Carvalho", "Lucas Bezerra", "Luciana Santely", "Luciano Cartucho", "Luciano N Lima", "Luís Carvalho", "Lycia Gabriella", "Mageda Nasser", "Manuella Castro", "Maria Oliveira", "Mariana Batista", "Maryluce Alves", "Mayane Marques", "Mayara Araújo", "Mayara Silva Caldas", "Max Caldas", "Mercêdes Vieira", "Michelle C. Gomes", "Mylena Rosas", "Neto Rodrigues", "Neudymara Fernandes", "Nirvana Cassiano Ribha Santos", "Rafaela Lobato", "Renata Portela", "Randerson Araujo", "Reinaldo Iglesias", "Reinaldo Reis", "Rodrigo Ribeiro", "Rodrigo Santos", "Ruanny Ferreira", "Olga Catarina Coelho", "Salma Araújo", "Samara Corrêa", "Sandro Stenio", "Silas Cardoso Junqueira Ayres", "Sueila Liá", "Thamyres Abreu", "Valeria Lopes", "Wander Rodrigues", "Yoone Santos", "Yuri Anderson"
];

const allThirdPartiesData = [...initialThirdPartiesData, ...generateNewCollaborators(newNames, initialThirdPartiesData.length + 1)];

// --- Users ---
const usersData = [
    { id: 1, name: 'Ana Beatriz Costa', email: 'ana.costa@sesisenaisp.org.br', unidade: 'SESI - Campinas', profile: 'Unidade', createdBy: 'Daniel', createdAt: '10/01/2023', lastEditedBy: 'Rafael', lastEditedAt: '15/05/2024' },
    { id: 2, name: 'Bruno Alves', email: 'bruno.alves@sesisenaisp.org.br', unidade: 'SENAI - Sorocaba', profile: 'Sede', createdBy: 'Paulo H. R. Silva', createdAt: '12/02/2023' },
    { id: 3, name: 'Carlos Eduardo Lima', email: 'carlos.lima@sesisenaisp.org.br', unidade: 'SESI - Jundiaí', profile: 'Gestor de unidade', createdBy: 'Rafael', createdAt: '05/03/2023', lastEditedBy: 'Daniel', lastEditedAt: '20/04/2024' },
    { id: 4, name: 'Daniela Ferreira', email: 'daniela.ferreira@sesisenaisp.org.br', unidade: 'SENAI - Bauru', profile: 'Unidade', createdBy: 'Teste', createdAt: '18/04/2023' },
    { id: 9, name: 'Fernando Almeida', email: 'fernando.almeida@sesisenaisp.org.br', unidade: 'SESI - Santos', profile: 'Sede', createdBy: 'Paulo H. R. Silva', createdAt: '22/07/2023' },
    { id: 6, name: 'Fernanda Gonçalves', email: 'fernanda.goncalves@sesisenaisp.org.br', unidade: 'SENAI - Osasco', profile: 'Gestor de unidade', createdBy: 'Daniel', createdAt: '14/05/2023', lastEditedBy: 'Rafael', lastEditedAt: '01/06/2024' },
    { id: 7, name: 'Gustavo Ribeiro', email: 'gustavo.ribeiro@sesisenaisp.org.br', unidade: 'SESI - Piracicaba', profile: 'Unidade', createdBy: 'Teste', createdAt: '30/06/2023' },
    { id: 8, name: 'Helena Souza', email: 'helena.souza@sesisenaisp.org.br', unidade: 'SENAI - Tatuí', profile: 'Sede', createdBy: 'Paulo H. R. Silva', createdAt: '09/08/2023' },
    { id: 10, name: 'Paulo H. R. Silva', email: 'paulo.ribeiro.3@sesisenaisp.org.br', unidade: 'SESI - SP - Belenzinho', profile: 'Gerência de Facilities', createdBy: 'Sistema', createdAt: '01/01/2023' },
    { id: 11, name: 'Daniel', email: 'daniel@sesisenaisp.org.br', unidade: 'SENAI - SP - Brás', profile: 'Sede', createdBy: 'Sistema', createdAt: '01/01/2023' },
    { id: 12, name: 'Rafael', email: 'rafael@sesisenaisp.org.br', unidade: 'SENAI - SP - Brás', profile: 'Gestor de unidade', createdBy: 'Sistema', createdAt: '01/01/2023' },
    { id: 13, name: 'Teste', email: 'teste@sesisenaisp.org.br', unidade: 'SENAI - SP - Mooca', profile: 'Unidade', createdBy: 'Sistema', createdAt: '01/01/2023' },
];

let sesiCounter = 1;
let senaiCounter = 1;

const nifMap = {
    'paulo.ribeiro.3@sesisenaisp.org.br': `SS${String(sesiCounter++).padStart(4, '0')}`,
    'daniel@sesisenaisp.org.br': `SN${String(senaiCounter++).padStart(4, '0')}`,
    'rafael@sesisenaisp.org.br': `SN${String(senaiCounter++).padStart(4, '0')}`,
    'teste@sesisenaisp.org.br': `SN${String(senaiCounter++).padStart(4, '0')}`,
};

const initialUsers = usersData.map(user => {
    if (nifMap[user.email]) {
        return { ...user, nif: nifMap[user.email] };
    }
    const isSesi = user.unidade.startsWith('SESI');
    const nif = isSesi 
        ? `SS${String(sesiCounter++).padStart(4, '0')}`
        : `SN${String(senaiCounter++).padStart(4, '0')}`;
    return { ...user, nif };
}).sort((a, b) => a.name.localeCompare(b.name));


// --- Seeding Function ---

async function seed() {
    try {
        await sequelize.sync({ force: true }); // Reset DB
        console.log('Database synced.');

        // Seed Companies and Contracts
        for (const companyData of allCompanies) {
            const company = await Company.create({
                name: companyData.name,
                cnpj: companyData.cnpj
            });

            for (const contractData of companyData.contracts) {
                await Contract.create({
                    ...contractData,
                    CompanyId: company.id
                });
            }
        }
        console.log('Companies and Contracts seeded.');

        // Seed Third Parties and History
        for (const tpData of allThirdPartiesData) {
            const { history, ...tpFields } = tpData;
            const thirdParty = await ThirdParty.create(tpFields);

            for (const historyData of history) {
                await ThirdPartyHistory.create({
                    ...historyData,
                    ThirdPartyId: thirdParty.id
                });
            }
        }
        console.log('Third Parties seeded.');

        // Seed Users
        for (const userData of initialUsers) {
            await User.create(userData);
        }
        console.log('Users seeded.');

        console.log('Seeding complete.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
