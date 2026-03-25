import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ClientSidebar from '../components/ClientSidebar'
import api from '../services/api'
import { User, Lock, ArrowLeft } from 'lucide-react'
import './Profile.css'

export default function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ 
        nom: user?.nom || '', 
        prenom: user?.prenom || '', 
        telephone: user?.telephone || '', 
        ville: user?.ville || '', 
        email: user?.email || '' 
    })
    const [passwords, setPasswords] = useState({ ancien_password: '', nouveau_password: '', confirm: '' })
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [successPwd, setSuccessPwd] = useState('')
    const [errorPwd, setErrorPwd] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Automatically populate from context if available immediately
        if (user) {
            setForm(prev => ({
                ...prev,
                nom: user.nom || prev.nom,
                prenom: user.prenom || prev.prenom,
                email: user.email || prev.email,
                telephone: user.telephone || prev.telephone,
                ville: user.ville || prev.ville
            }))
        }
        fetchProfile()
    }, [user])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile')
            const u = res.data.data || res.data
            setForm({ 
                nom: u.nom || user?.nom || '', 
                prenom: u.prenom || user?.prenom || '', 
                telephone: u.telephone || user?.telephone || '', 
                ville: u.ville || user?.ville || '', 
                email: u.email || user?.email || '' 
            })
            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    const handleChangePwd = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSuccess(''); setError('')
        try {
            await api.put('/profile', form)
            setSuccess('✓ Profil mis à jour avec succès!')
            setTimeout(() => setSuccess(''), 4000)
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour')
        }
    }

    const handlePassword = async (e) => {
        e.preventDefault()
        setSuccessPwd(''); setErrorPwd('')
        if (passwords.nouveau_password !== passwords.confirm) {
            return setErrorPwd('Les mots de passe ne correspondent pas')
        }
        try {
            await api.put('/profile/password', {
                ancien_password: passwords.ancien_password,
                nouveau_password: passwords.nouveau_password
            })
            setSuccessPwd('✓ Mot de passe changé avec succès!')
            setPasswords({ ancien_password: '', nouveau_password: '', confirm: '' })
            setTimeout(() => setSuccessPwd(''), 4000)
        } catch (err) {
            setErrorPwd(err.response?.data?.message || 'Erreur')
        }
    }

    const getBackLink = () => {
        if (user?.role === 'admin') return '/admin'
        if (user?.role === 'technicien') return '/technicien'
        if (user?.role === 'superadmin') return '/superadmin'
        return '/dashboard-client'
    }

    const handleLogout = () => { logout(); navigate('/login') }

    if (loading) return <div className="loading">Chargement...</div>

    return (
        <div className="profile-container">
            {user?.role === 'client' && <ClientSidebar />}
            
            <div className={user?.role === 'client' ? 'profile-main-with-sidebar' : 'profile-main'}>
                <div className="profile-header">
                    <div className="profile-header-top">
                        <button onClick={() => navigate(getBackLink())} className="btn-back">
                            <ArrowLeft size={20} /> Retour
                        </button>
                        <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                    </div>
                    
                    <div className="profile-hero">
                        <div className="user-avatar-large">
                            {user?.prenom?.[0]}{user?.nom?.[0]}
                        </div>
                        <div className="profile-hero-text">
                            <h1 className="profile-title">{user?.prenom} {user?.nom}</h1>
                            <p className="profile-role">{user?.role === 'client' ? 'Client' : user?.role === 'admin' ? 'Administrateur' : user?.role === 'technicien' ? 'Technicien' : 'Super Admin'}</p>
                        </div>
                    </div>
                </div>

                <div className="profile-grid">
                    <div className="profile-card">
                        <div className="card-header">
                            <User size={24} />
                            <h2>Informations personnelles</h2>
                        </div>

                        {success && <div className="alert-success">{success}</div>}
                        {error && <div className="alert-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="nom">Nom *</label>
                                    <input 
                                        id="nom"
                                        name="nom" 
                                        value={form.nom} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Votre nom"
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="prenom">Prénom *</label>
                                    <input 
                                        id="prenom"
                                        name="prenom" 
                                        value={form.prenom} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Votre prénom"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="email">Email</label>
                                    <input 
                                        id="email"
                                        name="email" 
                                        type="email"
                                        value={form.email} 
                                        disabled 
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="telephone">Téléphone</label>
                                    <input 
                                        id="telephone"
                                        name="telephone" 
                                        value={form.telephone} 
                                        onChange={handleChange} 
                                        placeholder="06XXXXXXXX"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group full-width">
                                    <label htmlFor="ville">Ville</label>
                                    <input 
                                        id="ville"
                                        name="ville" 
                                        value={form.ville} 
                                        onChange={handleChange} 
                                        placeholder="Casablanca"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-submit">Sauvegarder les modifications</button>
                        </form>
                    </div>

                    <div className="profile-card">
                        <div className="card-header">
                            <Lock size={24} />
                            <h2>Changer le mot de passe</h2>
                        </div>

                        {successPwd && <div className="alert-success">{successPwd}</div>}
                        {errorPwd && <div className="alert-error">{errorPwd}</div>}

                        <form onSubmit={handlePassword}>
                            <div className="input-group">
                                <label htmlFor="ancien_password">Ancien mot de passe *</label>
                                <input 
                                    id="ancien_password"
                                    type="password" 
                                    name="ancien_password" 
                                    value={passwords.ancien_password} 
                                    onChange={handleChangePwd} 
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="nouveau_password">Nouveau mot de passe *</label>
                                <input 
                                    id="nouveau_password"
                                    type="password" 
                                    name="nouveau_password" 
                                    value={passwords.nouveau_password} 
                                    onChange={handleChangePwd} 
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirm">Confirmer mot de passe *</label>
                                <input 
                                    id="confirm"
                                    type="password" 
                                    name="confirm" 
                                    value={passwords.confirm} 
                                    onChange={handleChangePwd} 
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>

                            <button type="submit" className="btn-submit">Changer le mot de passe</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}