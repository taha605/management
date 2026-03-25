import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { loginIllustrations } from '../assets/illustrations'
import './Login.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/auth/login', { email, password })
            login(res.data.user, res.data.token)
            const role = res.data.user.role
            if (role === 'admin') navigate('/admin')
            else if (role === 'superadmin') navigate('/superadmin')
            else if (role === 'technicien') navigate('/technicien')
            else navigate('/client')
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-wrapper">
            <div className="login-container">
                {/* Left Side - Illustration */}
                <div className="login-illustration">
                    <div className="illustration-content">
                        <img 
                            src={loginIllustrations.mainIllustration} 
                            alt="Login illustration" 
                            className="illustration-image"
                        />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-form-section">
                    <div className="login-form-card">

                        {error && <div className="login-error-message">{error}</div>}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={18} />
                                    <input 
                                        id="email"
                                        type="email" 
                                        placeholder="example@gmail.com"
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Mot de passe</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input 
                                        id="password"
                                        type={showPassword ? 'text' : 'password'} 
                                        placeholder="••••••••"
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                        className="form-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="toggle-password"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Se souvenir de moi</span>
                                </label>
                                <Link to="/forgot-password" className="forgot-password-link">
                                    Mot de passe oublié?
                                </Link>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="login-button"
                            >
                                {loading ? 'Connexion en cours...' : 'Connexion'}
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Vous n'avez pas de compte? 
                                <Link to="/register" className="register-link">S'inscrire</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}