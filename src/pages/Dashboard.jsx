import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import PredictionAPI from "../service/predictionAPI";

export const Dashboard = (props) => {
    const [stats, setStats] = useState(null);
    const [last24hStats, setLast24hStats] = useState(null);
    const [genderStats, setGenderStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);
    const [genderChartData, setGenderChartData] = useState(null);
    const [genderChartOptions, setGenderChartOptions] = useState(null);
    const [showTriageLevelsModal, setShowTriageLevelsModal] = useState(false);

    const predictionAPI = new PredictionAPI();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [summaryData, last24hData, genderData] = await Promise.all([
                predictionAPI.getStatsSummary(),
                predictionAPI.getLast24HoursStats(),
                predictionAPI.getGenderStats()
            ]);
            setStats(summaryData);
            setLast24hStats(last24hData);
            setGenderStats(genderData);
            
            // Prepare chart data for level distribution
            if (summaryData.levelDistribution) {
                const getKTASDisplay = (level) => {
                    const names = {
                        1: 'Resuscitation',
                        2: 'Emergency',
                        3: 'Urgent',
                        4: 'Less Urgent',
                        5: 'Non-Urgent'
                    };
                    return `${level}: (${names[level] || 'Unknown'})`;
                };
                
                const labels = Object.keys(summaryData.levelDistribution).map(level => getKTASDisplay(parseInt(level)));
                const values = Object.values(summaryData.levelDistribution);
                
                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            data: values,
                            backgroundColor: [
                                '#3B82F6', // Blue - Level 1
                                '#10B981', // Green - Level 2
                                '#F59E0B', // Amber - Level 3
                                '#EF4444', // Red - Level 4
                                '#8B5CF6', // Purple - Level 5
                                '#06B6D4', // Cyan - Level 6
                                '#F97316', // Orange - Level 7
                                '#84CC16'  // Lime - Level 8
                            ],
                            borderColor: '#ffffff',
                            borderWidth: 2,
                            hoverBorderWidth: 3,
                            hoverOffset: 8
                        }
                    ]
                });

                setChartOptions({
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 20,
                                font: {
                                    size: 12,
                                    weight: '500'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#ffffff',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    spacing: 2
                });
            }

            // Prepare chart data for gender distribution
            if (genderData) {
                setGenderChartData({
                    labels: ['Male', 'Female'],
                    datasets: [
                        {
                            data: [genderData.male || 0, genderData.female || 0],
                            backgroundColor: [
                                '#3B82F6', // Professional blue for male
                                '#EC4899'  // Professional pink for female
                            ],
                            borderColor: '#ffffff',
                            borderWidth: 3,
                            hoverBorderWidth: 4,
                            hoverOffset: 10
                        }
                    ]
                });

                setGenderChartOptions({
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 25,
                                font: {
                                    size: 14,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#ffffff',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                    return `${context.label}: ${context.parsed} patients (${percentage}%)`;
                                }
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    spacing: 3
                });
            }
        } catch (err) {
            setError('Failed to fetch statistics');
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <div className="grid">
                            <div className="col-12 md:col-6 lg:col-3">
                                <Skeleton height="100px" />
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Skeleton height="100px" />
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Skeleton height="100px" />
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Skeleton height="100px" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Skeleton height="300px" />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <div className="text-center p-4">
                            <i className="pi pi-exclamation-triangle text-orange-500 text-4xl mb-3"></i>
                            <p className="text-lg">{error}</p>
                            <button 
                                className="p-button p-button-outlined mt-3"
                                onClick={fetchStats}
                            >
                                Retry
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            {/* <div className="col-12">
                <h1 className="text-3xl font-bold mb-4">Dashboard Statistics</h1>
            </div> */}
            
            {/* Statistics Cards */}
            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center h-full" style={{ minHeight: '120px' }}>
                    <div className="flex flex-column align-items-center h-full justify-content-center p-2">
                        <i className="pi pi-chart-line text-3xl text-blue-500 mb-2"></i>
                        <div className="text-xl font-bold text-900">{stats?.totalPredictions || 0}</div>
                        <div className="text-800 text-sm">Total Predictions</div>
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <div 
                    className="cursor-pointer transition-all transition-duration-200 hover:shadow-4 hover:scale-105 h-full"
                    onClick={() => {
                        console.log('Triage Levels card clicked!');
                        setShowTriageLevelsModal(true);
                    }}
                    style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        minHeight: '120px'
                    }}
                >
                    <Card className="text-center h-full" style={{ minHeight: '120px' }}>
                        <div className="flex flex-column align-items-center h-full justify-content-center p-2">
                            <i className="pi pi-users text-3xl text-green-500 mb-2"></i>
                            <div className="text-xl font-bold text-900">
                                {stats?.levelDistribution ? Object.keys(stats.levelDistribution).length : 0}
                            </div>
                            <div className="text-800 text-sm">Triage Levels</div>
                            <div className="text-xs text-500 mt-1">
                                <i className="pi pi-info-circle mr-1"></i>
                                Click to view
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center h-full" style={{ minHeight: '120px' }}>
                    <div className="flex flex-column align-items-center h-full justify-content-center p-2">
                        <i className="pi pi-exclamation-triangle text-3xl text-orange-500 mb-2"></i>
                        <div className="text-xl font-bold text-900">
                            {stats?.levelDistribution ? 
                                Object.entries(stats.levelDistribution).reduce((max, [level, count]) => 
                                    count > max.count ? { level, count } : max, 
                                    { level: '0', count: 0 }
                                ).level : '0'
                            }
                        </div>
                        <div className="text-800 text-sm">Most Common Level</div>
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center h-full" style={{ minHeight: '120px' }}>
                    <div className="flex flex-column align-items-center h-full justify-content-center p-2">
                        <i className="pi pi-clock text-3xl text-purple-500 mb-2"></i>
                        <div className="text-xl font-bold text-900">
                            {last24hStats?.count || 0}
                        </div>
                        <div className="text-800 text-sm">Last 24 Hours</div>
                    </div>
                </Card>
            </div>


            {/* Level Distribution Chart */}
            <div className="col-12 lg:col-6">
                <Card 
                    title="Triage Level Distribution" 
                    className="h-full"
                    style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                >
                    <div className="p-3">
                        <div style={{ height: '320px', position: 'relative' }}>
                            {chartData && chartOptions ? (
                                <Chart 
                                    type="doughnut" 
                                    data={chartData} 
                                    options={chartOptions}
                                />
                            ) : (
                                <div className="text-center p-4 h-full flex flex-column align-items-center justify-content-center">
                                    <i className="pi pi-chart-pie text-6xl text-gray-300 mb-3"></i>
                                    <p className="text-gray-500 text-lg">No data available for chart</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gender Distribution Chart */}
            <div className="col-12 lg:col-6">
                <Card 
                    title="Patient Gender Distribution" 
                    className="h-full"
                    style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                >
                    <div className="p-3">
                        <div style={{ height: '320px', position: 'relative' }}>
                            {genderChartData && genderChartOptions ? (
                                <Chart 
                                    type="pie" 
                                    data={genderChartData} 
                                    options={genderChartOptions}
                                />
                            ) : (
                                <div className="text-center p-4 h-full flex flex-column align-items-center justify-content-center">
                                    <i className="pi pi-chart-pie text-6xl text-gray-300 mb-3"></i>
                                    <p className="text-gray-500 text-lg">No gender data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Level Details Table */}
            <div className="col-6">
                <Card title="Level Breakdown">
                    <div className="grid">
                        {stats?.levelDistribution ? 
                            Object.entries(stats.levelDistribution)
                                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                .map(([level, count]) => (
                                    <div key={level} className="col-12 md:col-6 lg:col-3">
                                        <div className="flex justify-content-between align-items-center p-2 border-1 border-200 border-round mb-2">
                                            <div className="flex align-items-center">
                                                <div className="w-2rem h-2rem border-round bg-blue-100 flex align-items-center justify-content-center mr-3">
                                                    <span className="text-sm font-bold text-blue-600">{level}</span>
                                                </div>
                                                <span className="font-medium">Level {level}</span>
                                            </div>
                                            <div className="flex align-items-center">
                                                <span className="font-bold text-900 mr-2">{count}</span>
                                                <span className="text-600 text-sm">
                                                    ({stats.totalPredictions > 0 ? 
                                                        Math.round((count / stats.totalPredictions) * 100) : 0}%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : 
                            <div className="col-12 text-center p-4">
                                <i className="pi pi-info-circle text-2xl text-gray-400 mb-2"></i>
                                <p className="text-600">No level data available</p>
                            </div>
                        }
                    </div>
                </Card>
            </div>

            {/* Triage Levels Modal */}
            <Dialog
                header="Triage Levels Details"
                visible={showTriageLevelsModal}
                style={{ width: '50vw' }}
                onHide={() => {
                    console.log('Modal closing...');
                    setShowTriageLevelsModal(false);
                }}
                maximizable
                modal
                className="p-fluid"
            >
                <div className="grid">
                    <div className="col-12">
                        <div className="text-center mb-4">
                            <i className="pi pi-info-circle text-4xl text-blue-500 mb-3"></i>
                            <h3 className="text-2xl font-bold text-900 mb-2">Triage Level Distribution</h3>
                            <p className="text-600">Detailed breakdown of all triage levels and their patient counts</p>
                        </div>
                    </div>
                    
                    {stats?.levelDistribution ? (
                        <>
                            <div className="col-12">
                                <div className="grid">
                                    {Object.entries(stats.levelDistribution)
                                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                        .map(([level, count]) => {
                                            const percentage = stats.totalPredictions > 0 ? 
                                                Math.round((count / stats.totalPredictions) * 100) : 0;
                                            return (
                                                <div key={level} className="col-12 md:col-6 lg:col-4">
                                                    <div className="p-3 border-1 border-200 border-round mb-3 hover:shadow-2 transition-all transition-duration-200">
                                                        <div className="flex align-items-center justify-content-between mb-2">
                                                            <div className="flex align-items-center">
                                                                <div className="w-3rem h-3rem border-round bg-blue-100 flex align-items-center justify-content-center mr-3">
                                                                    <span className="text-lg font-bold text-blue-600">{level}</span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-900">Level {level}</div>
                                                                    <div className="text-sm text-600">Triage Level</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-900">{count}</div>
                                                                <div className="text-sm text-600">patients</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-content-between align-items-center">
                                                            <div className="text-sm text-500">
                                                                {percentage}% of total
                                                            </div>
                                                            <div className="w-full bg-gray-200 border-round" style={{ height: '4px' }}>
                                                                <div 
                                                                    className="bg-blue-500 border-round transition-all transition-duration-500"
                                                                    style={{ 
                                                                        width: `${percentage}%`, 
                                                                        height: '100%' 
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            
                            <div className="col-12">
                                <div className="p-3 bg-blue-50 border-1 border-blue-200 border-round">
                                    <div className="flex align-items-center justify-content-between">
                                        <div>
                                            <div className="font-bold text-900 text-lg">Total Patients</div>
                                            <div className="text-600">Across all triage levels</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-blue-600">{stats.totalPredictions}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="col-12 text-center p-4">
                            <i className="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
                            <p className="text-600 text-lg">No triage level data available</p>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-content-end mt-4">
                    <Button 
                        label="Close" 
                        icon="pi pi-times" 
                        onClick={() => setShowTriageLevelsModal(false)}
                        className="p-button-outlined"
                    />
                </div>
            </Dialog>
        </div>
    );
};
