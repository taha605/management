import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { Wrench } from 'lucide-react'
import './Register.css'

export default function Register() {
    const [form, setForm] = useState({
        nom: '', prenom: '', email: '',
        password: '', telephone: '', ville: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await api.post('/auth/register', form)
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur inscription')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-logo"><Wrench /></div>
                <h2 className="register-title">Créer un compte</h2>
                <p className="register-subtitle">Plateforme de gestion des réclamations</p>

                {error && <div className="register-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="register-row">
                        <div className="input-group">
                            <label>Nom</label>
                            <input name="nom" placeholder="Alami"
                                value={form.nom} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Prénom</label>
                            <input name="prenom" placeholder="Youssef"
                                value={form.prenom} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" name="email" placeholder="votre@email.com"
                            value={form.email} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input type="password" name="password" placeholder="••••••••"
                            value={form.password} onChange={handleChange} required />
                    </div>

                    <div className="register-row">
                        <div className="input-group">
                            <label>Téléphone</label>
                            <input name="telephone" placeholder="06XXXXXXXX"
                                value={form.telephone} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Ville</label>
                            <input name="ville" placeholder="Casablanca"
                                value={form.ville} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" className={loading ? 'btn-register disabled' : 'btn-register'} disabled={loading}>
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </button>
                </form>

                <p className="register-footer">
                    Déjà un compte? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    )
}