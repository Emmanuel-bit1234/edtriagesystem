import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { TabView, TabPanel } from "primereact/tabview";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import axios from "axios";

export const NurseReport = (props) => {
    const [loading, setLoading] = useState(false);
    const [loadingNurses, setLoadingNurses] = useState(false);
    const [nurses, setNurses] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const toast = useRef(null);

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    // Load nurses list on component mount
    useEffect(() => {
        loadNurses();
    }, []);

    // Load nurses from API
    const loadNurses = async () => {
        try {
            setLoadingNurses(true);
            const response = await axios.get('https://triagecdssproxy.vercel.app/nurse-reports/nurses/list', {
                headers: getAuthHeaders()
            });
            setNurses(response.data.nurses);
        } catch (error) {
            console.error('Error loading nurses:', error);
            setError('Failed to load nurses list');
        } finally {
            setLoadingNurses(false);
        }
    };

    // Generate report
    const generateReport = async () => {
        if (!selectedNurse) {
            setError('Please select a nurse');
            return;
        }

        // Validate date if selected
        if (selectedDate) {
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            if (selectedDate > today) {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Invalid Date',
                    detail: 'Please select a date that is not in the future',
                    life: 3000
                });
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);
            setReportData(null); // Clear previous report data
            
            let url = `https://triagecdssproxy.vercel.app/nurse-reports/${selectedNurse.id}`;
            const params = new URLSearchParams();
            
            if (selectedDate) {
                const dateStr = selectedDate.toISOString().split('T')[0];
                console.log('Selected date:', selectedDate);
                console.log('Date string being sent:', dateStr);
                console.log('Today:', new Date().toISOString().split('T')[0]);
                params.append('date', dateStr);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axios.get(url, {
                headers: getAuthHeaders()
            });
            
            console.log('Response data:', response.data);
            console.log('Report period:', response.data.report?.period);
            
            setReportData(response.data.report);
            prepareCharts(response.data.report);
        } catch (error) {
            console.error('Error generating report:', error);
            console.error('Error response:', error.response);
            setError(null); // Clear any existing error
            
            // Check for different error scenarios
            if (error.response) {
                const status = error.response.status;
                
                if (status === 404 || status === 400) {
                    // No data available for this nurse
                    toast.current.show({
                        severity: 'warn',
                        summary: 'No Data Available',
                        detail: 'No report available for the selected nurse',
                        life: 3000
                    });
                } else if (status === 500) {
                    // Server error - likely no data or server issue
                    toast.current.show({
                        severity: 'warn',
                        summary: 'No Data Available',
                        detail: 'No report available for the selected nurse',
                        life: 3000
                    });
                } else {
                    // Other errors
                    setError('Failed to generate report');
                }
            } else {
                // Network or other errors
                setError('Failed to generate report');
            }
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const prepareCharts = (data) => {
        // Level Distribution Chart
        const levelData = {
            labels: [
                getKTASDisplay(1),
                getKTASDisplay(2),
                getKTASDisplay(3),
                getKTASDisplay(4),
                getKTASDisplay(5)
            ],
            datasets: [{
                data: [
                    data.summary.levelDistribution['1'] || 0,
                    data.summary.levelDistribution['2'] || 0,
                    data.summary.levelDistribution['3'] || 0,
                    data.summary.levelDistribution['4'] || 0,
                    data.summary.levelDistribution['5'] || 0
                ],
                backgroundColor: [
                    '#EF4444', // Red - Level 1 (Resuscitation)
                    '#F97316', // Orange - Level 2 (Emergency)
                    '#F59E0B', // Amber - Level 3 (Urgent)
                    '#10B981', // Green - Level 4 (Less Urgent)
                    '#3B82F6'  // Blue - Level 5 (Non-Urgent)
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 8
            }]
        };

        // Gender Distribution Chart
        const genderData = {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [
                    data.demographics.genderDistribution.male || 0,
                    data.demographics.genderDistribution.female || 0
                ],
                backgroundColor: [
                    '#3B82F6', // Professional blue for male
                    '#EC4899'  // Professional pink for female
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 8
            }]
        };

        // Age Groups Chart
        const ageData = {
            labels: ['Pediatric (0-17)', 'Adult (18-64)', 'Elderly (65+)'],
            datasets: [{
                data: [
                    data.demographics.ageGroups.pediatric || 0,
                    data.demographics.ageGroups.adult || 0,
                    data.demographics.ageGroups.elderly || 0
                ],
                backgroundColor: [
                    '#10B981', // Green for pediatric
                    '#F59E0B', // Amber for adult
                    '#8B5CF6'  // Purple for elderly
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 8
            }]
        };

        setChartData({
            levelDistribution: levelData,
            genderDistribution: genderData,
            ageGroups: ageData
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
    };


    // Get KTAS level color (matching EDPrediction colors)
    const getKTASColor = (level) => {
        const colors = {
            1: 'red',      // Resuscitation
            2: 'orange',   // Emergency
            3: 'yellow',   // Urgent
            4: 'green',    // Less Urgent
            5: 'blue'      // Non-Urgent
        };
        return colors[level] || 'grey';
    };

    // Get KTAS level name
    const getKTASName = (level) => {
        const names = {
            1: 'Resuscitation',
            2: 'Emergency',
            3: 'Urgent',
            4: 'Less Urgent',
            5: 'Non-Urgent'
        };
        return names[level] || 'Unknown';
    };

    // Get KTAS level display with number and name
    const getKTASDisplay = (level) => {
        const name = getKTASName(level);
        return `${level}: (${name})`;
    };

    // Get arrival mode name
    const getArrivalModeName = (mode) => {
        const modes = {
            1: 'Walk-in',
            2: 'Transfer',
            3: 'Ambulance'
        };
        return modes[mode] || 'Unknown';
    };

    // Summary cards
    const SummaryCards = () => (
        <div className="grid">
            <div className="col-6 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="text-6xl font-bold text-blue-500 mb-2">
                        {reportData?.summary?.totalPatients || 0}
                    </div>
                    <div className="text-600">Total Patients</div>
                </Card>
            </div>
            <div className="col-6 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="text-6xl font-bold text-red-500 mb-2">
                        {reportData?.summary?.criticalPatients || 0}
                    </div>
                    <div className="text-600">Critical Patients</div>
                </Card>
            </div>
            <div className="col-6 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="text-6xl font-bold text-orange-500 mb-2">
                        {reportData?.summary?.mostCommonLevel || 0}
                    </div>
                    <div className="text-600">Most Common KTAS Level</div>
                </Card>
            </div>
            <div className="col-6 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="text-6xl font-bold text-green-500 mb-2">
                        {reportData?.summary?.lowUrgencyPatients || 0}
                    </div>
                    <div className="text-600">Low Urgency Patients</div>
                </Card>
            </div>
        </div>
    );

    // Level distribution table
    const LevelDistributionTable = () => (
        <DataTable value={Object.entries(reportData?.summary?.levelDistribution || {}).map(([level, count]) => ({
            level: parseInt(level),
            count,
            percentage: ((count / reportData.summary.totalPatients) * 100).toFixed(1)
        }))} className="p-datatable-sm">
            <Column field="level" header="KTAS Level" body={(rowData) => (
                <Tag 
                    value={getKTASDisplay(rowData.level)} 
                    style={{ 
                        backgroundColor: getKTASColor(rowData.level),
                        color: 'white',
                        border: 'none'
                    }}
                />
            )} />
            <Column field="count" header="Count" />
            <Column field="percentage" header="Percentage" body={(rowData) => `${rowData.percentage}%`} />
        </DataTable>
    );

    // Top complaints table
    const TopComplaintsTable = () => (
        <DataTable value={reportData?.insights?.topChiefComplaints || []} className="p-datatable-sm">
            <Column field="complaint" header="Chief Complaint" />
            <Column field="count" header="Count" />
        </DataTable>
    );

    // Vital signs ranges
    const VitalSignsCard = () => (
        <Card title="Vital Signs Ranges" className="h-full">
            <div className="grid">
                <div className="col-6">
                    <div className="text-center p-3 border-round border-1 surface-border">
                        <div className="text-2xl font-bold text-blue-500">Blood Pressure</div>
                        <div className="text-600">
                            {reportData?.insights?.vitalSignsRanges?.bloodPressure?.min || 0} - {reportData?.insights?.vitalSignsRanges?.bloodPressure?.max || 0}
                        </div>
                        <div className="text-sm text-500">Avg: {reportData?.insights?.vitalSignsRanges?.bloodPressure?.avg || 0}</div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="text-center p-3 border-round border-1 surface-border">
                        <div className="text-2xl font-bold text-green-500">Heart Rate</div>
                        <div className="text-600">
                            {reportData?.insights?.vitalSignsRanges?.heartRate?.min || 0} - {reportData?.insights?.vitalSignsRanges?.heartRate?.max || 0}
                        </div>
                        <div className="text-sm text-500">Avg: {reportData?.insights?.vitalSignsRanges?.heartRate?.avg || 0}</div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="text-center p-3 border-round border-1 surface-border">
                        <div className="text-2xl font-bold text-orange-500">Respiratory Rate</div>
                        <div className="text-600">
                            {reportData?.insights?.vitalSignsRanges?.respiratoryRate?.min || 0} - {reportData?.insights?.vitalSignsRanges?.respiratoryRate?.max || 0}
                        </div>
                        <div className="text-sm text-500">Avg: {reportData?.insights?.vitalSignsRanges?.respiratoryRate?.avg || 0}</div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="text-center p-3 border-round border-1 surface-border">
                        <div className="text-2xl font-bold text-purple-500">Temperature</div>
                        <div className="text-600">
                            {reportData?.insights?.vitalSignsRanges?.bodyTemperature?.min || 0}°C - {reportData?.insights?.vitalSignsRanges?.bodyTemperature?.max || 0}°C
                        </div>
                        <div className="text-sm text-500">Avg: {reportData?.insights?.vitalSignsRanges?.bodyTemperature?.avg || 0}°C</div>
                    </div>
                </div>
            </div>
        </Card>
    );

    // Risk factors
    const RiskFactorsCard = () => (
        <Card title="Risk Factors" className="h-full">
            <div className="grid">
                {Object.entries(reportData?.insights?.riskFactors || {}).map(([factor, count]) => (
                    <div key={factor} className="col-6">
                        <div className="flex align-items-center justify-content-between p-2 border-round border-1 surface-border">
                            <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <Badge value={count} severity={count > 0 ? 'warning' : 'success'} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );

    // Clear date function
    const clearDate = () => {
        setSelectedDate(null);
    };

    // Format date for display
    const formatDateForDisplay = (date) => {
        if (!date) return '';
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Toolbar
    const toolbarLeft = (
        <div className="flex flex-column md:flex-row align-items-start md:align-items-center">
            <Dropdown
                value={selectedNurse}
                options={nurses}
                onChange={(e) => setSelectedNurse(e.value)}
                optionLabel="name"
                placeholder="Select Nurse"
                className="w-full md:w-20rem mb-3 md:mb-0 md:mr-3"
                disabled={loadingNurses}
            />
            <div className="flex align-items-center w-full md:w-auto mb-3 md:mb-0 md:mr-3">
                <Calendar
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.value)}
                    placeholder="Select Date (Optional)"
                    dateFormat="yy-mm-dd"
                    showIcon
                    disabled={loading}
                    maxDate={new Date()}
                    className="w-full md:w-auto"
                />
                {selectedDate && (
                    <Button
                        label="Clear"
                        className="p-button-text p-button-sm ml-2"
                        onClick={clearDate}
                        disabled={loading}
                        tooltip="Clear Date"
                    />
                )}
            </div>
            <Button
                label="Generate Report"
                icon="pi pi-chart-line"
                onClick={generateReport}
                disabled={!selectedNurse || loading}
                loading={loading}
                className="w-full md:w-auto"
            />
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title={
                    reportData ? (
                        <div className="flex align-items-center justify-content-between w-full">
                            <div>
                                <h2 className="m-0 text-2xl">Nurse Performance Report - {reportData.nurse.name}</h2>
                                <p className="text-600 text-sm m-0">
                                    {selectedDate 
                                        ? `Daily Report - ${formatDateForDisplay(selectedDate)}`
                                        : 'Overall Performance Report'
                                    }
                                </p>
                                <p className="text-500 text-xs m-0">
                                    Email: {reportData.nurse.email}
                                </p>
                            </div>
                        </div>
                    ) : "Nurse Performance Report"
                }>
                    <Toolbar left={toolbarLeft} />
                    
                    {error && (
                        <Message severity="error" text={error} className="mt-3" />
                    )}

                    {loading && (
                        <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
                            <ProgressSpinner />
                        </div>
                    )}

                    {reportData && !loading && (
                        <div className="mt-4">

                            {/* Summary Cards */}
                            <SummaryCards />

                            <Divider />

                            {/* Detailed Analytics */}
                            <TabView>
                                <TabPanel header="Overview" leftIcon="pi pi-chart-bar">
                                    <div className="grid">
                                        <div className="col-12 lg:col-6">
                                            <Card title="KTAS Level Distribution" className="h-full">
                                                <Chart type="doughnut" data={chartData.levelDistribution} options={chartOptions} style={{ height: '300px' }} />
                                            </Card>
                                        </div>
                                        <div className="col-12 lg:col-6">
                                            <Card title="Level Distribution Details" className="h-full">
                                                <LevelDistributionTable />
                                            </Card>
                                        </div>
                                    </div>
                                </TabPanel>

                                <TabPanel header="Demographics" leftIcon="pi pi-users">
                                    <div className="grid">
                                        <div className="col-12 lg:col-4">
                                            <Card title="Gender Distribution" className="h-full">
                                                <Chart type="pie" data={chartData.genderDistribution} options={chartOptions} style={{ height: '250px' }} />
                                            </Card>
                                        </div>
                                        <div className="col-12 lg:col-4">
                                            <Card title="Age Groups" className="h-full">
                                                <Chart type="pie" data={chartData.ageGroups} options={chartOptions} style={{ height: '250px' }} />
                                            </Card>
                                        </div>
                                        <div className="col-12 lg:col-4">
                                            <Card title="Arrival Modes" className="h-full">
                                                <div className="text-center">
                                                    {Object.entries(reportData.demographics.arrivalModeDistribution || {}).map(([mode, count]) => (
                                                        <div key={mode} className="mb-3 p-3 border-round border-1 surface-border">
                                                            <div className="text-xl font-bold">{count}</div>
                                                            <div className="text-600">{getArrivalModeName(parseInt(mode))}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </TabPanel>


                                <TabPanel header="Insights" leftIcon="pi pi-lightbulb">
                                    <div className="grid">
                                        <div className="col-12 lg:col-6">
                                            <Card title="Top Chief Complaints" className="h-full">
                                                <TopComplaintsTable />
                                            </Card>
                                        </div>
                                        <div className="col-12 lg:col-6">
                                            <VitalSignsCard />
                                        </div>
                                        <div className="col-12">
                                            <RiskFactorsCard />
                                        </div>
                                    </div>
                                </TabPanel>

                            </TabView>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default NurseReport;
