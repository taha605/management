import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import SuperAdminSidebar from '../../components/SuperAdminSidebar'
import './Dashboard.css'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function AdminDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)

    // fetch stats
    const fetchStats = async () => {
        try {
            const res = await api.get('/reclamations/stats')
            return res.data.data
        } catch (err) {
            console.error(err)
            return null
        }
    }

    // load stats once
    useEffect(() => {
        const loadStats = async () => {
            const statsData = await fetchStats()
            setStats(statsData)
        }
        loadStats()
    }, [])

    const pieData = {
        labels: ['En attente', 'En cours', 'Résolues', 'Assignées'],
        datasets: [{
            data: [
                stats?.en_attente || 0,
                stats?.en_cours || 0,
                stats?.resolues || 0,
                stats?.assignees || 0
            ],
            backgroundColor: ['#f39c12', '#9b59b6', '#27ae60', '#3498db'],
            borderWidth: 0
        }]
    }

    const barData = {
        labels: ['Total', 'En attente', 'En cours', 'Résolues'],
        datasets: [{
            label: 'Réclamations',
            data: [
                stats?.total || 0,
                stats?.en_attente || 0,
                stats?.en_cours || 0,
                stats?.resolues || 0
            ],
            backgroundColor: ['#0D9E75', '#f39c12', '#9b59b6', '#27ae60'],
            borderRadius: 8,
            borderWidth: 0
        }]
    }

    return (
        <div className="admin-container">
            {user?.role === 'superadmin' ? <SuperAdminSidebar /> : <AdminSidebar />}
            <div className="admin-main">
                <div className="admin-header">
                    <h1 className="admin-title">Tableau de bord</h1>
                </div>
                {user?.role === 'superadmin' && (
                    <div className="admin-readonly-banner" role="status">
                        <strong>Vue synthétique — consultation seule.</strong> Ces indicateurs reflètent
                        l&apos;activité opérationnelle. Les actions sur les réclamations (assignation, etc.)
                        sont réservées aux <strong>administrateurs</strong>. La création ou modification des
                        comptes se fait via <strong>Super admin</strong>.
                    </div>
                )}
                {stats && (
                    <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">Total</div>
                        </div>
                        <div className="stat-card stat-orange">
                            <div className="stat-number">{stats.en_attente}</div>
                            <div className="stat-label">En attente</div>
                        </div>
                        <div className="stat-card stat-blue">
                            <div className="stat-number">{stats.en_cours}</div>
                            <div className="stat-label">En cours</div>
                        </div>
                        <div className="stat-card stat-green">
                            <div className="stat-number">{stats.resolues}</div>
                            <div className="stat-label">Résolues</div>
                        </div>
                    </div>

                    <div className="charts-grid">
                        <div className="chart-card">
                            <h3 className="chart-title">Répartition par statut</h3>
                            <div className="chart-pie">
                                <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#333' } } } }} />
                            </div>
                        </div>
                        <div className="chart-card">
                            <h3 className="chart-title">Vue générale</h3>
                            <div className="chart-bar" style={{height: '300px'}}>
                                <Bar data={barData} options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { labels: { color: '#333' } } },
                                    scales: {
                                        x: { ticks: { color: '#555' }, grid: { color: '#eee' } },
                                        y: { ticks: { color: '#555' }, grid: { color: '#eee' } }
                                    }
                                }} />
                            </div>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
    )
}
