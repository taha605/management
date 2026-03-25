import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { Crown, User, X } from 'lucide-react'
import './Dashboard.css'

export default function SuperAdminDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [form, setForm] = useState({
        nom: '', prenom: '', email: '',
        password: '', telephone: '', ville: ''
    })

    useEffect(() => {
        fetchAdmins()
    }, [])

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/users/admins')
            setAdmins(res.data.data)
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
            await api.post('/users/admins', form)
            setSuccess('Admin créé avec succès!')
            setShowForm(false)
            setForm({ nom: '', prenom: '', email: '', password: '', telephone: '', ville: '' })
            fetchAdmins()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur')
        }
    }

    const handleToggle = async (id) => {
        try {
            await api.put(`/users/admins/${id}/toggle`)
            fetchAdmins()
        } catch (err) {
            console.error(err)
        }
    }
    const handleDelete = async (id) => {
    if(!window.confirm('Supprimer cet admin?')) return
    try {
        await api.delete(`/users/admins/${id}`)
        fetchAdmins()
    } catch (err) {
        console.error(err)
    }
}

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div className="sa-container">
            <nav className="sa-nav">
                <div className="nav-brand"><Crown /> SuperAdmin</div>
                <div className="nav-right">
                    <span className="nav-user"><User /> {user?.prenom} {user?.nom}</span>
                    <Link to="/profile" className="nav-link"><User /> Profil</Link>
        
                    <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                </div>
            </nav>

            <div className="sa-main">
                <div className="sa-header">
                    <h1 className="sa-title">Gestion des Admins</h1>
                    <button onClick={() => setShowForm(true)} className="btn-new">
                        + Ajouter Admin
                    </button>
                </div>

                {success && <div className="alert-success">{success}</div>}
                {error && <div className="alert-error">{error}</div>}

                {showForm && (
                    <div className="sa-modal-overlay" onClick={() => setShowForm(false)}>
                        <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="sa-modal-header">
                                <h3>Nouvel Admin</h3>
                                <button
                                    type="button"
                                    className="sa-modal-close"
                                    onClick={() => setShowForm(false)}
                                    aria-label="Fermer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="sa-form">
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Nom *</label>
                                        <input name="nom" placeholder="Entrer nom" value={form.nom} onChange={handleChange} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Prénom *</label>
                                        <input name="prenom" placeholder="Entrer prénom" value={form.prenom} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Email *</label>
                                    <input type="email" name="email" placeholder="Entrer email" value={form.email} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Mot de passe *</label>
                                    <input type="password" name="password" placeholder="Créer mot de passe" value={form.password} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Téléphone</label>
                                        <input name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} />
                                    </div>
                                    <div className="input-group">
                                        <label>Ville</label>
                                        <input name="ville" placeholder="Ville" value={form.ville} onChange={handleChange} />
                                    </div>
                                </div>
                                <button type="submit" className="btn-submit">Créer Admin</button>
                            </form>
                        </div>
                    </div>
                )}

                {loading ? <div className="loading">Chargement...</div> : (
                    <div className="table-wrapper">
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Ville</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.prenom} {a.nom}</td>
                                        <td>{a.email}</td>
                                        <td>{a.ville || '—'}</td>
                                        <td>
                                            <span className={`badge ${a.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                {a.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                onClick={() => handleToggle(a.id)}
                                                className={a.is_active ? 'btn-disable' : 'btn-enable'}>
                                                {a.is_active ? 'Désactiver' : 'Activer'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a.id)} className="btn-delete">
                                                     Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {admins.length === 0 && (
                            <div className="empty">Aucun admin trouvé</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}