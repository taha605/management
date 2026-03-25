import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ClientSidebar from '../../components/ClientSidebar'
import DashboardCharts from '../../components/DashboardCharts'
import api from '../../services/api'
import './Dashboard.css'

export default function ClientDashboard() {
    const { user } = useAuth()
    const [reclamations, setReclamations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReclamations()
    }, [])

    const fetchReclamations = async () => {
        try {
            const res = await api.get('/reclamations/my')
            setReclamations(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="client-container">
            <ClientSidebar />

            <div className="client-main">
                <div className="client-header">
                    <h1 className="client-title">Centre de Gestion</h1>
                </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : (
                    <DashboardCharts reclamations={reclamations} />
                )}
            </div>
        </div>
    )
}
