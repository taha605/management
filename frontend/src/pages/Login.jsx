import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Login.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.user, res.data.token);
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'superadmin') navigate('/superadmin');
        else if (role === 'technicien') navigate('/technicien');
        else navigate('/client');

    } catch (err) {
        setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">🔧</div>
                <h2 className="login-title">Connexion</h2>
                <p className="login-subtitle">Plateforme de gestion des réclamations</p>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" placeholder="votre@email.com"
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input type="password" placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className={loading ? 'btn-login disabled' : 'btn-login'} disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                <p className="login-footer">
                    Pas de compte? <Link to="/register">S'inscrire</Link>
                </p>
            </div>
        </div>
    )
}