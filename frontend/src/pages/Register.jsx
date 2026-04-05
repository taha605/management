import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin } from 'lucide-react'
import api from '../services/api'
import { loginIllustrations } from '../assets/illustrations'
import './Register.css'

export default function Register() {
    const [form, setForm] = useState({
        nom: '', prenom: '', email: '',
        password: '', telephone: '', ville: ''
    })
    const [showPassword, setShowPassword] = useState(false)
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
        <div className="register-wrapper">
            <div className="register-container">
                {/* Left Side - Illustration */}
                <div className="register-illustration">
                    <div className="illustration-content">
                        <img 
                            src={loginIllustrations.mainIllustration} 
                            alt="Register illustration" 
                            className="illustration-image"
                        />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="register-form-section">
                    <div className="register-form-card">
                        <h2 className="form-title">Créer un compte</h2>
                        <br />

                        {error && <div className="register-error-message">{error}</div>}

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="register-form">
                            {/* Name Row */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="nom" className="form-label">Nom</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-slot" aria-hidden>
                                            <User size={18} strokeWidth={2} />
                                        </span>
                                        <input
                                            id="nom"
                                            name="nom"
                                            type="text"
                                            placeholder="Alami"
                                            value={form.nom}
                                            onChange={handleChange}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="prenom" className="form-label">Prénom</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-slot" aria-hidden>
                                            <User size={18} strokeWidth={2} />
                                        </span>
                                        <input
                                            id="prenom"
                                            name="prenom"
                                            type="text"
                                            placeholder="Youssef"
                                            value={form.prenom}
                                            onChange={handleChange}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <div className="input-wrapper">
                                    <span className="input-icon-slot" aria-hidden>
                                        <Mail size={18} strokeWidth={2} />
                                    </span>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Mot de passe</label>
                                <div className="input-wrapper">
                                    <span className="input-icon-slot" aria-hidden>
                                        <Lock size={18} strokeWidth={2} />
                                    </span>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="toggle-password"
                                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                    >
                                        {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                                    </button>
                                </div>
                            </div>

                            {/* Phone and City Row */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="telephone" className="form-label">Téléphone</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-slot" aria-hidden>
                                            <Phone size={18} strokeWidth={2} />
                                        </span>
                                        <input
                                            id="telephone"
                                            name="telephone"
                                            type="tel"
                                            placeholder="06XXXXXXXX"
                                            value={form.telephone}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ville" className="form-label">Ville</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-slot" aria-hidden>
                                            <MapPin size={18} strokeWidth={2} />
                                        </span>
                                        <input
                                            id="ville"
                                            name="ville"
                                            type="text"
                                            placeholder="Casablanca"
                                            value={form.ville}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="register-button"
                            >
                                {loading ? 'Création du compte...' : 'Créer un compte'}
                            </button>
                        </form>

                        <div className="register-footer">
                            <p>Vous avez déjà un compte?
                                <Link to="/login" className="login-link">Connexion</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}