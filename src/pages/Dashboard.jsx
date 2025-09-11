import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
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
                const labels = Object.keys(summaryData.levelDistribution).map(level => `Level ${level}`);
                const values = Object.values(summaryData.levelDistribution);
                
                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            data: values,
                            backgroundColor: [
                                '#42A5F5',
                                '#66BB6A',
                                '#FFA726',
                                '#EF5350',
                                '#AB47BC',
                                '#26A69A',
                                '#FFCA28',
                                '#8D6E63'
                            ],
                            borderWidth: 0
                        }
                    ]
                });

                setChartOptions({
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
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
                                '#42A5F5',
                                '#FF69B4'
                            ],
                            borderWidth: 0
                        }
                    ]
                });

                setGenderChartOptions({
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
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
                <Card className="text-center">
                    <div className="flex flex-column align-items-center">
                        <i className="pi pi-chart-line text-4xl text-blue-500 mb-3"></i>
                        <div className="text-2xl font-bold text-900">{stats?.totalPredictions || 0}</div>
                        <div className="text-600">Total Predictions</div>
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="flex flex-column align-items-center">
                        <i className="pi pi-users text-4xl text-green-500 mb-3"></i>
                        <div className="text-2xl font-bold text-900">
                            {stats?.levelDistribution ? Object.keys(stats.levelDistribution).length : 0}
                        </div>
                        <div className="text-600">Triage Levels</div>
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="flex flex-column align-items-center">
                        <i className="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
                        <div className="text-2xl font-bold text-900">
                            {stats?.levelDistribution ? 
                                Object.entries(stats.levelDistribution).reduce((max, [level, count]) => 
                                    count > max.count ? { level, count } : max, 
                                    { level: '0', count: 0 }
                                ).level : '0'
                            }
                        </div>
                        <div className="text-600">Most Common Level</div>
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="flex flex-column align-items-center">
                        <i className="pi pi-clock text-4xl text-purple-500 mb-3"></i>
                        <div className="text-2xl font-bold text-900">
                            {last24hStats?.count || 0}
                        </div>
                        <div className="text-600">Last 24 Hours</div>
                    </div>
                </Card>
            </div>


            {/* Level Distribution Chart */}
            <div className="col-12 lg:col-6">
                <Card title="Triage Level Distribution">
                    <div style={{ height: '300px' }}>
                        {chartData && chartOptions ? (
                            <Chart 
                                type="doughnut" 
                                data={chartData} 
                                options={chartOptions}
                            />
                        ) : (
                            <div className="text-center p-4">
                                <i className="pi pi-chart-pie text-4xl text-gray-400 mb-3"></i>
                                <p>No data available for chart</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Gender Distribution Chart */}
            <div className="col-12 lg:col-6">
                <Card title="Patient Gender Distribution">
                    <div style={{ height: '300px' }}>
                        {genderChartData && genderChartOptions ? (
                            <Chart 
                                type="pie" 
                                data={genderChartData} 
                                options={genderChartOptions}
                            />
                        ) : (
                            <div className="text-center p-4">
                                <i className="pi pi-chart-pie text-4xl text-gray-400 mb-3"></i>
                                <p>No gender data available</p>
                            </div>
                        )}
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
        </div>
    );
};
