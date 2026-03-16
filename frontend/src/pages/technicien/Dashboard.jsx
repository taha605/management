import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { Wrench, HardHat, User, Smartphone, MapPin, Phone, Calendar, Circle, Play, Check } from 'lucide-react'
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

    const getStatutColor = (statut) => {
        const colors = {
            en_attente: '#f39c12', assignee: '#3498db',
            en_cours: '#9b59b6', resolue: '#27ae60',
            fermee: '#95a5a6', annulee: '#e74c3c'
        }
        return colors[statut] || '#888'
    }

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div className="tech-container">
            <nav className="tech-nav">
                <div className="nav-brand"><Wrench /> ReclamationPro</div>
                <div className="nav-right">
                    <span className="nav-user"><HardHat /> {user?.prenom} {user?.nom}</span>
                    <Link to="/profile" className="nav-link"><User /> Profil</Link>
                    <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                </div>
            </nav>

            <div className="tech-main">
                <h1 className="tech-title">Mes Missions</h1>

                {success && <div className="alert-success">{success}</div>}
                {error && <div className="alert-error">{error}</div>}

                {loading ? <div className="loading">Chargement...</div> : (
                    <div className="missions-list">
                        {reclamations.length === 0 ? (
                            <div className="empty">Aucune mission assignée</div>
                        ) : reclamations.map(r => (
                            <div key={r.id} className="mission-card">
                                <div className="mission-header">
                                    <strong>{r.reference}</strong>
                                    <span className="badge" style={{background: getStatutColor(r.statut)}}>
                                        {r.statut.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="mission-body">
                                    <p><Smartphone /> {r.marque} {r.modele}</p>
                                    <p><User /> {r.client_nom}</p>
                                    <p><MapPin /> {r.adresse_intervention}, {r.ville_intervention}</p>
                                    <p><Phone /> {r.client_telephone}</p>
                                    <p><Calendar /> {new Date(r.date_reclamation).toLocaleDateString('fr-FR')}</p>
                                    <p><Circle className="red-circle" /> {r.description_panne}</p>
                                </div>
                                <div className="mission-actions">
                                    {r.statut === 'assignee' && (
                                        <button onClick={() => updateStatut(r.id, 'en_cours')} className="btn-encours">
                                            <Play /> Démarrer
                                        </button>
                                    )}
                                    {r.statut === 'en_cours' && (
                                        <button onClick={() => updateStatut(r.id, 'resolue')} className="btn-resolue">
                                            <Check /> Marquer résolu
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}