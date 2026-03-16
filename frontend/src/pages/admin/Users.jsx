import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import './Users.css'

export default function AdminUsers() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [form, setForm] = useState({
        nom: '', prenom: '', email: '',
        password: '', telephone: '', ville: '', role: 'technicien'
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users')
            setUsers(res.data.data)
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
            await api.post('/users', form)
            setSuccess('Utilisateur créé avec succès!')
            setShowForm(false)
            setForm({ nom: '', prenom: '', email: '', password: '', telephone: '', ville: '', role: 'technicien' })
            fetchUsers()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur')
        }
    }

    const handleRoleChange = async (id, role) => {
        try {
            await api.put(`/users/${id}/role`, { role })
            fetchUsers()
        } catch (err) {
            console.error(err)
        }
    }

    const handleToggle = async (id) => {
        try {
            await api.put(`/users/${id}/toggle`)
            fetchUsers()
        } catch (err) {
            console.error(err)
        }
    }

    const getRoleColor = (role) => {
        const colors = { admin: '#e74c3c', technicien: '#3498db', client: '#27ae60' }
        return colors[role] || '#888'
    }

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div className="users-container">
            <nav className="users-nav">
                <div className="nav-brand">🔧 ReclamationPro</div>
                <div className="nav-right">
                    <Link to="/admin" className="nav-link">Dashboard</Link>
                    <span className="nav-user">👤 {user?.prenom} {user?.nom}</span>
                    <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                </div>
            </nav>

            <div className="users-main">
                <div className="users-header">
                    <h1 className="users-title">Gestion des Utilisateurs</h1>
                    <button onClick={() => setShowForm(!showForm)} className="btn-new">
                        {showForm ? '✕ Annuler' : '+ Ajouter utilisateur'}
                    </button>
                </div>

                {success && <div className="alert-success">{success}</div>}
                {error && <div className="alert-error">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h3>Nouvel utilisateur</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Nom *</label>
                                    <input name="nom" placeholder="Alami" value={form.nom} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Prénom *</label>
                                    <input name="prenom" placeholder="Youssef" value={form.prenom} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Email *</label>
                                <input type="email" name="email" placeholder="votre@email.com" value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label>Mot de passe *</label>
                                <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Téléphone</label>
                                    <input name="telephone" placeholder="06XXXXXXXX" value={form.telephone} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Ville</label>
                                    <input name="ville" placeholder="Casablanca" value={form.ville} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Rôle *</label>
                                <select name="role" value={form.role} onChange={handleChange}>
                                    <option value="technicien">Technicien</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-submit">Créer</button>
                        </form>
                    </div>
                )}

                {loading ? <div className="loading">Chargement...</div> : (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.prenom} {u.nom}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className="badge" style={{background: getRoleColor(u.role)}}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                {u.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                className="select-role"
                                            >
                                                <option value="client">Client</option>
                                                <option value="technicien">Technicien</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleToggle(u.id)}
                                                className={u.is_active ? 'btn-disable' : 'btn-enable'}
                                            >
                                                {u.is_active ? 'Désactiver' : 'Activer'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}