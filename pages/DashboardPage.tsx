import React, { useState, useMemo, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { UserGroupIcon, BuildingOfficeIcon, CheckCircleIcon, XCircleIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../src/services/api';
import { ThirdParty } from './ManageThirdPartiesPage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
    const [unitData, setUnitData] = useState<{ SESI: string[], SENAI: string[] }>({ SESI: [], SENAI: [] });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tpData, unitsData] = await Promise.all([
                    api.get('/third-parties'),
                    api.get('/units')
                ]);
                setThirdParties(tpData.data);
                setUnitData(unitsData.data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };
        loadData();
    }, []);

    const allUnits = useMemo(() => {
        return [...unitData.SESI, ...unitData.SENAI].sort();
    }, [unitData]);

    const dashboardData = useMemo(() => {
        let filteredData = thirdParties;

        if (selectedUnits.length > 0) {
            filteredData = filteredData.filter(tp => 
                tp.unidades.some(u => selectedUnits.includes(u))
            );
        }
        
        // If user is restricted, filter by their unit
        if (user && (user.profile === 'Unidade' || user.profile === 'Gestor de unidade')) {
             filteredData = filteredData.filter(tp => tp.unidades.includes(user.unidade));
        }

        const totalFuncionarios = filteredData.length;
        const ativos = filteredData.filter(tp => tp.status === 'Ativo').length;
        const inativos = filteredData.filter(tp => tp.status === 'Inativo').length;
        const totalInsalubridade = filteredData.filter(tp => tp.recebeInsalubridade === 'Sim').length;

        const funcionariosPorCargo = filteredData.reduce((acc, curr) => {
            acc[curr.cargo] = (acc[curr.cargo] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const funcionariosPorEmpresa = filteredData.reduce((acc, curr) => {
            acc[curr.razaoSocial] = (acc[curr.razaoSocial] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalFuncionarios,
            totalInsalubridade,
            status: [{ label: 'Ativos', value: ativos, color: '#800000' }, { label: 'Inativos', value: inativos, color: '#000080' }],
            porCargo: Object.entries(funcionariosPorCargo).map(([label, value]) => ({ label, value })),
            porEmpresa: Object.entries(funcionariosPorEmpresa).map(([label, value]) => ({ label, value })),
        };
    }, [selectedUnits, thirdParties, user, unitData]);

    const pieChartData = {
        labels: dashboardData.status.map(d => d.label),
        datasets: [
            {
                data: dashboardData.status.map(d => d.value),
                backgroundColor: dashboardData.status.map(d => d.color),
                borderColor: dashboardData.status.map(d => d.color),
                borderWidth: 1,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
             y: {
                 beginAtZero: true,
                 ticks: {
                     stepSize: 1
                 }
             }
        }
    };

    const cargoChartData = {
        labels: dashboardData.porCargo.map(d => d.label),
        datasets: [
            {
                label: 'Funcionários por Cargo',
                data: dashboardData.porCargo.map(d => d.value),
                backgroundColor: 'rgba(128, 0, 0, 0.7)',
            },
        ],
    };

    const empresaChartData = {
        labels: dashboardData.porEmpresa.map(d => d.label),
        datasets: [
            {
                label: 'Funcionários por Empresa',
                data: dashboardData.porEmpresa.map(d => d.value),
                backgroundColor: 'rgba(0, 0, 128, 0.7)',
            },
        ],
    };

    const toggleUnitSelection = (unit: string) => {
        setSelectedUnits(prev => 
            prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
        );
    };

    const clearFilters = () => {
        setSelectedUnits([]);
    };

    if (!user) return null;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600">Visão geral dos terceiros e contratos</p>
                </div>
                
                <div className="relative">
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700"
                    >
                        <FunnelIcon className="w-5 h-5" />
                        <span>Filtrar por Unidade</span>
                        {selectedUnits.length > 0 && (
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {selectedUnits.length}
                            </span>
                        )}
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700">Unidades</h3>
                                {selectedUnits.length > 0 && (
                                    <button 
                                        onClick={clearFilters}
                                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                        Limpar
                                    </button>
                                )}
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {allUnits.map(unit => (
                                    <label key={unit} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={selectedUnits.includes(unit)}
                                            onChange={() => toggleUnitSelection(unit)}
                                            className="rounded text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-600">{unit}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total de Funcionários</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.totalFuncionarios}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <UserGroupIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ativos</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.status.find(s => s.label === 'Ativos')?.value || 0}</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-600">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Inativos</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.status.find(s => s.label === 'Inativos')?.value || 0}</h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <XCircleIcon className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Recebem Insalubridade</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.totalInsalubridade}</h3>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <BuildingOfficeIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribuição por Cargo</h3>
                    <Bar options={barChartOptions} data={cargoChartData} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribuição por Empresa</h3>
                    <Bar options={barChartOptions} data={empresaChartData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Status dos Contratos</h3>
                    <div className="h-64 flex justify-center">
                        <Pie data={pieChartData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
