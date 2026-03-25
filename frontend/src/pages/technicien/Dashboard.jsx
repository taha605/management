import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { Wrench, HardHat, User, Smartphone, MapPin, Phone, Calendar, Circle, Play, Check } from 'lucide-react'
import TechSidebar from '../../components/TechSidebar'
import './Dashboard.css'

export default function TechnicienDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [reclamations, setReclamations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchReclamations()
    }, [])

    const fetchReclamations = async () => {
        try {
            const res = await api.get('/reclamations/tech')
            setReclamations(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const updateStatut = async (id, statut) => {
        setError('')
        setSuccess('')
        try {
            await api.put(`/reclamations/${id}/statut`, { statut })
            setSuccess('Statut mis à jour!')
            fetchReclamations()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur')
        }
    }

    const formatStatus = (statut) => {
        const statusMap = {
            'en_attente': 'En attente',
            'assignee': 'Assignée',
            'en_cours': 'En cours',
            'resolue': 'Résolue',
            'fermee': 'Fermée',
            'annulee': 'Annulée'
        }
        return statusMap[statut] || statut
    }

    return (
        <div className="tech-container">
            <TechSidebar />

            <div className="tech-main">
                <div className="tech-header">
                    <h1 className="tech-title">Mes Missions</h1>
                </div>

                {success && <div className="alert-success">{success}</div>}
                {error && <div className="alert-error">{error}</div>}

                {loading ? <div className="loading">Chargement...</div> : (
                    <div className="reclamations-table-wrap">
                        {reclamations.length === 0 ? (
                            <div className="empty">Aucune mission assignée</div>
                        ) : (
                            <>
                                <div className="table-head">
                                    <h2 className="table-title">Liste des missions</h2>
                                    <span className="table-count">{reclamations.length} mission(s)</span>
                                </div>
                                <div className="table-responsive">
                                    <table className="reclamations-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Référence</th>
                                                <th scope="col">Client</th>
                                                <th scope="col">Appareil</th>
                                                <th scope="col">Intervention</th>
                                                <th scope="col">Statut</th>
                                                <th scope="col">Date</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reclamations.map(r => (
                                                <tr key={r.id}>
                                                    <td className="cell-ref">{r.reference}</td>
                                                    <td>
                                                        <div className="cell-device">{r.client_nom}</div>
                                                        <div className="cell-device-model">{r.client_telephone}</div>
                                                    </td>
                                                    <td>
                                                        <div className="cell-device">{r.marque}</div>
                                                        <div className="cell-device-model">{r.modele || '-'}</div>
                                                    </td>
                                                    <td>
                                                        <div className="cell-device">{r.ville_intervention}</div>
                                                        <div className="cell-device-model">{r.adresse_intervention}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge rec-${r.statut}`}>
                                                            {formatStatus(r.statut)}
                                                        </span>
                                                    </td>
                                                    <td className="cell-date">
                                                        <Calendar size={13} /> {new Date(r.date_reclamation).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td>
                                                        {r.statut === 'assignee' && (
                                                            <button onClick={() => updateStatut(r.id, 'en_cours')} className="btn-action btn-encours">
                                                                Démarrer
                                                            </button>
                                                        )}
                                                        {r.statut === 'en_cours' && (
                                                            <button onClick={() => updateStatut(r.id, 'resolue')} className="btn-action btn-resolue">
                                                                Résoudre
                                                            </button>
                                                        )}
                                                        {r.statut !== 'assignee' && r.statut !== 'en_cours' && (
                                                            <span className="cell-tech">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}