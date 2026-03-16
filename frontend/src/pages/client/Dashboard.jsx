import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { Wrench, User, X, Smartphone, MapPin, Calendar, HardHat } from 'lucide-react'
import './Dashboard.css'

export default function ClientDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [reclamations, setReclamations] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        marque: '', modele: '', description_panne: '',
        adresse_intervention: '', ville_intervention: '', priorite: 'normale'
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        try {
            const res = await api.post('/reclamations', form)
            setSuccess(`Réclamation créée: ${res.data.data.reference}`)
            setShowForm(false)
            setForm({ marque: '', modele: '', description_panne: '', adresse_intervention: '', ville_intervention: '', priorite: 'normale' })
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
        <div className="client-container">
            <nav className="client-nav">
                <div className="nav-brand"><Wrench /> ReclamationPro</div>
                <div className="nav-right">
                    <span className="nav-user"><User /> {user?.prenom} {user?.nom}</span>
                    <Link to="/profile" className="nav-link"><User /> Profil</Link>
                    <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                </div>
            </nav>

            <div className="client-main">
                <div className="client-header">
                    <h1 className="client-title">Mes Réclamations</h1>
                    <button onClick={() => setShowForm(!showForm)} className="btn-new">
                        {showForm ? <><X /> Annuler</> : '+ Nouvelle Réclamation'}
                    </button>
                </div>

                {success && <div className="alert-success">{success}</div>}
                {error && <div className="alert-error">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h3>Nouvelle Réclamation</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Marque *</label>
                                    <input name="marque" placeholder="Samsung" value={form.marque} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Modèle</label>
                                    <input name="modele" placeholder="Galaxy S26" value={form.modele} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Description de la panne *</label>
                                <textarea name="description_panne" placeholder="Décrivez le problème..." value={form.description_panne} onChange={handleChange} required rows={3} />
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Adresse *</label>
                                    <input name="adresse_intervention" placeholder="123 Rue Hassan II" value={form.adresse_intervention} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Ville *</label>
                                    <input name="ville_intervention" placeholder="Casablanca" value={form.ville_intervention} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Priorité</label>
                                <select name="priorite" value={form.priorite} onChange={handleChange}>
                                    <option value="normale">Normale</option>
                                    <option value="urgente">Urgente</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-submit">Envoyer</button>
                        </form>
                    </div>
                )}

                {loading ? <div className="loading">Chargement...</div> : (
                    <div className="rec-list">
                        {reclamations.length === 0 ? (
                            <div className="empty">Aucune réclamation — cliquez sur "+ Nouvelle Réclamation"</div>
                        ) : reclamations.map(r => (
                            <div key={r.id} className="rec-card">
                                <div className="rec-card-header">
                                    <strong>{r.reference}</strong>
                                    <span className="badge" style={{background: getStatutColor(r.statut)}}>
                                        {r.statut.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="rec-card-body">
                                    <p><Smartphone /> {r.marque} {r.modele}</p>
                                    <p><MapPin /> {r.ville_intervention}</p>
                                    <p><Calendar /> {new Date(r.date_reclamation).toLocaleDateString('fr-FR')}</p>
                                    {r.technicien_nom && <p><HardHat /> {r.technicien_nom}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}