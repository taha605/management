import { useState, useEffect } from 'react'
import api from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'
import { X } from 'lucide-react'
import './Users.css'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('')
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
            setError('Erreur lors de la modification du rôle')
        }
    }

    const handleToggle = async (id) => {
        try {
            await api.put(`/users/${id}/toggle`)
            fetchUsers()
        } catch (err) {
            console.error(err)
            setError('Erreur lors de la modification du statut')
        }
    }

    const getRoleColor = (role) => {
        const colors = { admin: '#e74c3c', technicien: '#3498db', client: '#27ae60' }
        return colors[role] || '#888'
    }

    const getRoleLabel = (role) => {
        const labels = { admin: 'Admin', technicien: 'Technicien', client: 'Client' }
        return labels[role] || role
    }

    // Filter users based on search and role
    const filteredUsers = users.filter(u => {
        const nameMatch = `${u.prenom} ${u.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase())
        const roleMatch = !filterRole || u.role === filterRole
        return nameMatch && roleMatch
    })

    return (
        <div className="users-container">
            <AdminSidebar />

            <div className="users-main">
                <div className="users-header">
                    <h1 className="users-title">Gestion des Utilisateurs</h1>
                    <button onClick={() => setShowForm(true)} className="btn-new">
                        + Ajouter
                    </button>
                </div>

                {success && <div className="alert-success">{success}</div>}
                {error && <div className="alert-error">{error}</div>}

                {showForm && (
                    <div className="users-modal-overlay" onClick={() => setShowForm(false)}>
                        <div className="users-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="users-modal-header">
                                <h3>Nouvel utilisateur</h3>
                                <button onClick={() => setShowForm(false)} className="users-modal-close" aria-label="Fermer">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="users-form">
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Nom *</label>
                                        <input
                                            name="nom"
                                            placeholder="Alami"
                                            value={form.nom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Prénom *</label>
                                        <input
                                            name="prenom"
                                            placeholder="Youssef"
                                            value={form.prenom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="votre@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Mot de passe *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Téléphone</label>
                                        <input
                                            name="telephone"
                                            placeholder="06XXXXXXXX"
                                            value={form.telephone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Ville</label>
                                        <input
                                            name="ville"
                                            placeholder="Casablanca"
                                            value={form.ville}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Rôle *</label>
                                    <select name="role" value={form.role} onChange={handleChange} required>
                                        <option value="client">Client</option>
                                        <option value="technicien">Technicien</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn-submit">Créer utilisateur</button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="filters-section">
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom ou email..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select 
                        value={filterRole} 
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Tous les rôles</option>
                        <option value="client">Client</option>
                        <option value="technicien">Technicien</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading">Chargement des utilisateurs...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Nom et Prénom</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Statut</th>
                                    <th>Ville</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="user-info">
                                                    <div className="user-avatar">{u.prenom?.[0]}{u.nom?.[0]}</div>
                                                    <div className="user-details">
                                                        <strong>{u.prenom} {u.nom}</strong>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span 
                                                    className="badge" 
                                                    style={
                                                        u.role === 'admin' ? { background: '#FEF0E6', color: '#B85500' } :
                                                        u.role === 'technicien' ? { background: '#E6F7F6', color: '#0A7269' } :
                                                        { background: '#E6F7F2', color: '#1A8C6A' }
                                                    }
                                                >
                                                    {getRoleLabel(u.role)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                    {u.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td>{u.ville || '-'}</td>
                                            <td className="actions-cell">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    className="select-role"
                                                    title="Changer le rôle"
                                                >
                                                    <option value="client">Client</option>
                                                    <option value="technicien">Technicien</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button
                                                    onClick={() => handleToggle(u.id)}
                                                    className={`btn-toggle ${u.is_active ? 'btn-active' : 'btn-inactive'}`}
                                                    title={u.is_active ? 'Désactiver' : 'Activer'}
                                                >
                                                    {u.is_active ? 'Désactiver' : 'Activer'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center empty-state">
                                            Aucun utilisateur trouvé
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}