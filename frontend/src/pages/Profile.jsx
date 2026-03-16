import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './Profile.css'

export default function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', ville: '' })
    const [passwords, setPasswords] = useState({ ancien_password: '', nouveau_password: '', confirm: '' })
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [successPwd, setSuccessPwd] = useState('')
    const [errorPwd, setErrorPwd] = useState('')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile')
            const u = res.data.data
            setForm({ nom: u.nom, prenom: u.prenom, telephone: u.telephone || '', ville: u.ville || '' })
        } catch (err) {
            console.error(err)
        }
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    const handleChangePwd = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSuccess(''); setError('')
        try {
            await api.put('/profile', form)
            setSuccess('Profil mis à jour!')
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur')
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
            setSuccessPwd('Mot de passe changé!')
            setPasswords({ ancien_password: '', nouveau_password: '', confirm: '' })
        } catch (err) {
            setErrorPwd(err.response?.data?.message || 'Erreur')
        }
    }

    const getBackLink = () => {
        if (user?.role === 'admin') return '/admin'
        if (user?.role === 'technicien') return '/technicien'
        if (user?.role === 'superadmin') return '/superadmin'
        return '/client'
    }

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div className="profile-container">
            <nav className="profile-nav">
                <div className="nav-brand">🔧 ReclamationPro</div>
                <div className="nav-right">
                    <Link to={getBackLink()} className="nav-link">← Retour</Link>
                    <span className="nav-user">👤 {user?.prenom} {user?.nom}</span>
                    <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                </div>
            </nav>

            <div className="profile-main">
                <h1 className="profile-title">Mon Profil</h1>

                <div className="profile-grid">
                    <div className="profile-card">
                        <h3>Informations personnelles</h3>
                        {success && <div className="alert-success">{success}</div>}
                        {error && <div className="alert-error">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Nom *</label>
                                    <input name="nom" value={form.nom} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Prénom *</label>
                                    <input name="prenom" value={form.prenom} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Téléphone</label>
                                    <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="06XXXXXXXX" />
                                </div>
                                <div className="input-group">
                                    <label>Ville</label>
                                    <input name="ville" value={form.ville} onChange={handleChange} placeholder="Casablanca" />
                                </div>
                            </div>
                            <button type="submit" className="btn-submit">Sauvegarder</button>
                        </form>
                    </div>

                    <div className="profile-card">
                        <h3>Changer le mot de passe</h3>
                        {successPwd && <div className="alert-success">{successPwd}</div>}
                        {errorPwd && <div className="alert-error">{errorPwd}</div>}
                        <form onSubmit={handlePassword}>
                            <div className="input-group">
                                <label>Ancien mot de passe</label>
                                <input type="password" name="ancien_password" value={passwords.ancien_password} onChange={handleChangePwd} placeholder="••••••••" required />
                            </div>
                            <div className="input-group">
                                <label>Nouveau mot de passe</label>
                                <input type="password" name="nouveau_password" value={passwords.nouveau_password} onChange={handleChangePwd} placeholder="••••••••" required />
                            </div>
                            <div className="input-group">
                                <label>Confirmer mot de passe</label>
                                <input type="password" name="confirm" value={passwords.confirm} onChange={handleChangePwd} placeholder="••••••••" required />
                            </div>
                            <button type="submit" className="btn-submit">Changer</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}