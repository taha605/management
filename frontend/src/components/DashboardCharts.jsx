import { useState, useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import './DashboardCharts.css'

export default function DashboardCharts({ reclamations }) {
    const chartRefStatus = useRef(null)
    const chartRefPriority = useRef(null)
    const chartRefTrend = useRef(null)
    const chartStatusInstance = useRef(null)
    const chartPriorityInstance = useRef(null)
    const chartTrendInstance = useRef(null)

    useEffect(() => {
        if (!reclamations || reclamations.length === 0) return

        // Status distribution
        const statusCounts = {}
        const priorityCounts = { normale: 0, urgente: 0 }
        const monthCounts = {}

        reclamations.forEach(r => {
            statusCounts[r.statut] = (statusCounts[r.statut] || 0) + 1
            priorityCounts[r.priorite] = (priorityCounts[r.priorite] || 0) + 1
            
            const date = new Date(r.date_reclamation)
            const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
            monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
        })

        // Chart 1: Status Distribution
        if (chartRefStatus.current) {
            if (chartStatusInstance.current) chartStatusInstance.current.destroy()
            
            const ctx = chartRefStatus.current.getContext('2d')
            chartStatusInstance.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(statusCounts).map(s => s.toUpperCase()),
                    datasets: [{
                        data: Object.values(statusCounts),
                        backgroundColor: [
                            '#B06E10', // en_attente
                            '#0D9488', // assignee
                            '#E8740A', // en_cours
                            '#1A8C6A', // resolue
                            '#6B7685', // fermee
                            '#B85500'  // annulee
                        ],
                        borderColor: '#FFFFFF',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#1A1D23',
                                font: { size: 12, weight: '500' },
                                padding: 15
                            }
                        }
                    }
                }
            })
        }

        // Chart 2: Priority Distribution
        if (chartRefPriority.current) {
            if (chartPriorityInstance.current) chartPriorityInstance.current.destroy()
            
            const ctx = chartRefPriority.current.getContext('2d')
            chartPriorityInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Normale', 'Urgente'],
                    datasets: [{
                        label: 'Nombre de Réclamations',
                        data: [priorityCounts.normale, priorityCounts.urgente],
                        backgroundColor: [
                            '#1A8C6A',
                            '#B85500'
                        ],
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                color: '#9AA3B0',
                                stepSize: 1
                            },
                            grid: {
                                color: '#E2E5EA'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#1A1D23',
                                font: { size: 12, weight: '500' }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            })
        }

        // Chart 3: Trend Over Time
        if (chartRefTrend.current) {
            if (chartTrendInstance.current) chartTrendInstance.current.destroy()
            
            const sortedMonths = Object.keys(monthCounts).sort()
            const ctx = chartRefTrend.current.getContext('2d')
            chartTrendInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedMonths,
                    datasets: [{
                        label: 'Réclamations',
                        data: sortedMonths.map(m => monthCounts[m]),
                        borderColor: '#0D9488',
                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#0D9488',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#1A1D23',
                                font: { size: 12, weight: '500' }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#9AA3B0',
                                stepSize: 1
                            },
                            grid: {
                                color: '#E2E5EA'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#1A1D23',
                                font: { size: 12, weight: '500' }
                            },
                            grid: {
                                color: '#E2E5EA'
                            }
                        }
                    }
                }
            })
        }

        return () => {
            if (chartStatusInstance.current) chartStatusInstance.current.destroy()
            if (chartPriorityInstance.current) chartPriorityInstance.current.destroy()
            if (chartTrendInstance.current) chartTrendInstance.current.destroy()
        }
    }, [reclamations])

    const totalClaims = reclamations?.length || 0
    const resolvedClaims = reclamations?.filter(r => r.statut === 'resolue').length || 0
    const urgentClaims = reclamations?.filter(r => r.priorite === 'urgente').length || 0
    const resolutionRate = totalClaims > 0 ? Math.round((resolvedClaims / totalClaims) * 100) : 0

    return (
        <div className="dashboard-charts">
            {/* Stats Cards */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-number">{totalClaims}</div>
                    <div className="stat-label">Réclamations Total</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{resolvedClaims}</div>
                    <div className="stat-label">Résolues</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{urgentClaims}</div>
                    <div className="stat-label">Urgentes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{resolutionRate}%</div>
                    <div className="stat-label">Taux de Résolution</div>
                </div>
            </div>

            {/* Charts Container */}
            <div className="charts-grid">
                {/* Status Distribution */}
                <div className="chart-card">
                    <h3 className="chart-title">Distribution par Statut</h3>
                    <div className="chart-container">
                        <canvas ref={chartRefStatus}></canvas>
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="chart-card">
                    <h3 className="chart-title">Distribution par Priorité</h3>
                    <div className="chart-container horizontal">
                        <canvas ref={chartRefPriority}></canvas>
                    </div>
                </div>

                {/* Trend Over Time */}
                <div className="chart-card full-width">
                    <h3 className="chart-title">Tendance des Réclamations</h3>
                    <div className="chart-container">
                        <canvas ref={chartRefTrend}></canvas>
                    </div>
                </div>
            </div>
        </div>
    )
}
