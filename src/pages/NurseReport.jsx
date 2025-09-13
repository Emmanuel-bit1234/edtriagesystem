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
                params.append('date', dateStr);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axios.get(url, {
                headers: getAuthHeaders()
            });
            
            
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
                    '#DC2626', // Red - Level 1 (Resuscitation) - Most Critical
                    '#EA580C', // Orange - Level 2 (Emergency) - Very Urgent
                    '#EAB308', // Yellow - Level 3 (Urgent) - Urgent
                    '#16A34A', // Green - Level 4 (Less Urgent) - Less Urgent
                    '#2563EB'  // Blue - Level 5 (Non-Urgent) - Least Urgent
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
                        padding: 25,
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    cornerRadius: 12,
                    displayColors: true,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13,
                        weight: '500'
                    },
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
            cutout: '65%',
            spacing: 3
        });
    };


    // Get KTAS level color (matching Dashboard colors)
    const getKTASColor = (level) => {
        const colors = {
            1: '#DC2626',  // Red - Resuscitation (Most Critical)
            2: '#EA580C',  // Orange - Emergency (Very Urgent)
            3: '#EAB308',  // Yellow - Urgent
            4: '#16A34A',  // Green - Less Urgent
            5: '#2563EB'   // Blue - Non-Urgent (Least Urgent)
        };
        return colors[level] || '#6B7280';
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
                <Card 
                    className="text-center h-full cursor-pointer transition-all transition-duration-200 hover:shadow-4 hover:scale-105" 
                    style={{ minHeight: '140px' }}
                >
                    <div className="flex flex-column align-items-center h-full justify-content-center p-3">
                        <i className="pi pi-users text-4xl text-blue-500 mb-3"></i>
                        <div className="text-4xl font-bold text-900 mb-2">
                            {reportData?.summary?.totalPatients || 0}
                        </div>
                        <div className="text-600 font-medium">Total Patients</div>
                        <div className="text-xs text-500 mt-1">All triage levels</div>
                    </div>
                </Card>
            </div>
            <div className="col-6 md:col-6 lg:col-3">
                <Card 
                    className="text-center h-full cursor-pointer transition-all transition-duration-200 hover:shadow-4 hover:scale-105" 
                    style={{ minHeight: '140px' }}
                >
                    <div className="flex flex-column align-items-center h-full justify-content-center p-3">
                        <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
                        <div className="text-4xl font-bold text-900 mb-2">
                            {reportData?.summary?.criticalPatients || 0}
                        </div>
                        <div className="text-600 font-medium">Critical Patients</div>
                        <div className="text-xs text-500 mt-1">Level 1 & 2</div>
                    </div>
                </Card>
            </div>
            <div className="col-6 md:col-6 lg:col-3">
                <Card 
                    className="text-center h-full cursor-pointer transition-all transition-duration-200 hover:shadow-4 hover:scale-105" 
                    style={{ minHeight: '140px' }}
                >
                    <div className="flex flex-column align-items-center h-full justify-content-center p-3">
                        <i className="pi pi-chart-bar text-4xl text-orange-500 mb-3"></i>
                        <div className="text-4xl font-bold text-900 mb-2">
                            {reportData?.summary?.mostCommonLevel || 0}
                        </div>
                        <div className="text-600 font-medium">Most Common Level</div>
                        <div className="text-xs text-500 mt-1">KTAS Level</div>
                    </div>
                </Card>
            </div>
            <div className="col-6 md:col-6 lg:col-3">
                <Card 
                    className="text-center h-full cursor-pointer transition-all transition-duration-200 hover:shadow-4 hover:scale-105" 
                    style={{ minHeight: '140px' }}
                >
                    <div className="flex flex-column align-items-center h-full justify-content-center p-3">
                        <i className="pi pi-check-circle text-4xl text-green-500 mb-3"></i>
                        <div className="text-4xl font-bold text-900 mb-2">
                            {reportData?.summary?.lowUrgencyPatients || 0}
                        </div>
                        <div className="text-600 font-medium">Low Urgency</div>
                        <div className="text-xs text-500 mt-1">Level 4 & 5</div>
                    </div>
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
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.5rem'
                    }}
                />
            )} />
            <Column field="count" header="Count" />
            <Column field="percentage" header="Percentage" body={(rowData) => `${rowData.percentage}%`} />
        </DataTable>
    );

    // Top complaints table
    const TopComplaintsTable = () => (
        <DataTable 
            value={reportData?.insights?.topChiefComplaints || []} 
            className="p-datatable-sm"
            emptyMessage="No chief complaints data available"
        >
            <Column 
                field="complaint" 
                header="Chief Complaint" 
                body={(rowData) => (
                    <div className="flex align-items-center">
                        <i className="pi pi-file text-blue-500 mr-2"></i>
                        <span className="font-medium">{rowData.complaint}</span>
                    </div>
                )}
            />
            <Column 
                field="count" 
                header="Count" 
                body={(rowData) => (
                    <Badge 
                        value={rowData.count} 
                        severity="info" 
                        style={{ fontSize: '0.875rem', fontWeight: '600' }}
                    />
                )}
            />
        </DataTable>
    );

    // Vital signs ranges
    const VitalSignsCard = () => (
        <Card 
            title="Vital Signs Ranges" 
            className="h-full"
            style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
        >
            <div className="p-3">
                <div className="grid">
                    <div className="col-6">
                        <div className="text-center p-3 border-round border-1 surface-border hover:shadow-2 transition-all transition-duration-200">
                            <i className="pi pi-heart text-3xl text-blue-500 mb-2"></i>
                            <div className="text-xl font-bold text-900 mb-2">Blood Pressure</div>
                            <div className="text-600 font-medium">
                                {reportData?.insights?.vitalSignsRanges?.bloodPressure?.min || 0} - {reportData?.insights?.vitalSignsRanges?.bloodPressure?.max || 0}
                            </div>
                            <div className="text-sm text-500">Avg: {reportData?.insights?.vitalSignsRanges?.bloodPressure?.avg || 0}</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center p-3 border-round border-1 surface-border hover:shadow-2 transition-all transition-duration-200">
                            <i className="pi pi-heart text-3xl text-green-500 mb-2"></i>
                            <div className="text-xl font-bold text-900 mb-2">Heart Rate</div>
                            <div className="text-600 font-medium">
                                {reportData?.insights?.vitalSignsRanges?.heartRate?.min || 0} - {reportData?.insights?.vitalSignsRanges?.heartRate?.max || 0}
                            </div>
                            <div className="text-sm text-500">Avg: {reportData?.insights?.vitalSignsRanges?.heartRate?.avg || 0}</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center p-3 border-round border-1 surface-border hover:shadow-2 transition-all transition-duration-200">
                            <i className="pi pi-wind text-3xl text-orange-500 mb-2"></i>
                            <div className="text-xl font-bold text-900 mb-2">Respiratory Rate</div>
                            <div className="text-600 font-medium">
                                {reportData?.insights?.vitalSignsRanges?.respiratoryRate?.min || 0} - {reportData?.insights?.vitalSignsRanges?.respiratoryRate?.max || 0}
                            </div>
                            <div className="text-sm text-500">Avg: {reportData?.insights?.vitalSignsRanges?.respiratoryRate?.avg || 0}</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center p-3 border-round border-1 surface-border hover:shadow-2 transition-all transition-duration-200">
                            <i className="pi pi-thermometer text-3xl text-purple-500 mb-2"></i>
                            <div className="text-xl font-bold text-900 mb-2">Body Temperature</div>
                            <div className="text-600 font-medium">
                                {reportData?.insights?.vitalSignsRanges?.bodyTemperature?.min || 0}°C - {reportData?.insights?.vitalSignsRanges?.bodyTemperature?.max || 0}°C
                            </div>
                            <div className="text-sm text-500">Avg: {reportData?.insights?.vitalSignsRanges?.bodyTemperature?.avg || 0}°C</div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );

    // Risk factors
    const RiskFactorsCard = () => (
        <Card 
            title="Risk Factors" 
            className="h-full"
            style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
        >
            <div className="p-3">
                <div className="grid">
                    {Object.entries(reportData?.insights?.riskFactors || {}).map(([factor, count]) => (
                        <div key={factor} className="col-6">
                            <div className="flex align-items-center justify-content-between p-3 border-round border-1 surface-border hover:shadow-2 transition-all transition-duration-200">
                                <div className="flex align-items-center">
                                    <i className="pi pi-exclamation-triangle text-orange-500 mr-2"></i>
                                    <span className="capitalize font-medium">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </div>
                                <Badge 
                                    value={count} 
                                    severity={count > 0 ? 'warning' : 'success'} 
                                    style={{ fontSize: '0.875rem', fontWeight: '600' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
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
                                <p className="text-600 text-lg m-0">
                                    {selectedDate 
                                        ? `Daily Report - ${formatDateForDisplay(selectedDate)}`
                                        : 'Overall Performance Report'
                                    }
                                </p>
                                <p className="text-500 text-sm m-0">
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
                        <div className="flex flex-column justify-content-center align-items-center" style={{ height: '300px' }}>
                            <ProgressSpinner size="50px" />
                            <div className="mt-3 text-center">
                                <h4 className="text-900 mb-2">Generating Report</h4>
                                <p className="text-600">Please wait while we process the data...</p>
                            </div>
                        </div>
                    )}

                    {!reportData && !loading && !error && (
                        <div className="flex flex-column justify-content-center align-items-center" style={{ height: '400px' }}>
                            <i className="pi pi-chart-line text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-2xl font-bold text-900 mb-2">No Report Data</h3>
                            <p className="text-600 text-center mb-4">
                                Select a nurse and click "Generate Report" to view performance analytics
                            </p>
                            <div className="text-sm text-500">
                                <i className="pi pi-info-circle mr-2"></i>
                                Choose a nurse from the dropdown above to get started
                            </div>
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
                                            <Card 
                                                title="KTAS Level Distribution" 
                                                className="h-full"
                                                style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                            >
                                                <div className="p-3">
                                                    <div style={{ height: '320px', position: 'relative' }}>
                                                        <Chart type="doughnut" data={chartData.levelDistribution} options={chartOptions} />
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                        <div className="col-12 lg:col-6">
                                            <Card 
                                                title="Level Distribution Details" 
                                                className="h-full"
                                                style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                            >
                                                <div className="p-3">
                                                    <LevelDistributionTable />
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </TabPanel>

                                <TabPanel header="Demographics" leftIcon="pi pi-users">
                                    <div className="grid">
                                        <div className="col-12 lg:col-4">
                                            <Card 
                                                title="Gender Distribution" 
                                                className="h-full"
                                                style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                            >
                                                <div className="p-3">
                                                    <div style={{ height: '280px', position: 'relative' }}>
                                                        <Chart type="pie" data={chartData.genderDistribution} options={chartOptions} />
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                        <div className="col-12 lg:col-4">
                                            <Card 
                                                title="Age Groups" 
                                                className="h-full"
                                                style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                            >
                                                <div className="p-3">
                                                    <div style={{ height: '280px', position: 'relative' }}>
                                                        <Chart type="pie" data={chartData.ageGroups} options={chartOptions} />
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                        <div className="col-12 lg:col-4">
                                            <Card 
                                                title="Arrival Modes" 
                                                className="h-full"
                                                style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                            >
                                                <div className="p-3">
                                                    <div className="text-center">
                                                        {Object.entries(reportData.demographics.arrivalModeDistribution || {}).map(([mode, count]) => (
                                                            <div key={mode} className="mb-3 p-3 border-round border-1 surface-border hover:shadow-2 transition-all transition-duration-200">
                                                                <div className="text-2xl font-bold text-900">{count}</div>
                                                                <div className="text-600 font-medium">{getArrivalModeName(parseInt(mode))}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </TabPanel>


                                <TabPanel header="Insights" leftIcon="pi pi-lightbulb">
                                    <div className="grid">
                                        <div className="col-12 lg:col-6">
                                            <Card 
                                                title="Top Chief Complaints" 
                                                className="h-full"
                                                style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                            >
                                                <div className="p-3">
                                                    <TopComplaintsTable />
                                                </div>
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
