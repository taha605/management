import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ClipboardList, LogOut } from 'lucide-react'
import logo from '../assets/logo.png'
import './TechSidebar.css'

export default function TechSidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(true)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isActive = (path) => {
        return location.pathname === path
    }

    return (
        <>
            <button 
                className="sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle sidebar"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`tech-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Logo" className="sidebar-brand-logo" />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-item">
                        <button 
                            className={`sidebar-link ${isActive('/technicien') ? 'active' : ''}`}
                            onClick={() => navigate('/technicien')}
                        >
                            <ClipboardList size={20} />
                            {isOpen && <span>Mes Missions</span>}
                        </button>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button 
                        className="sidebar-user-info"
                        onClick={() => navigate('/profile')}
                        title={user?.prenom + ' ' + user?.nom}
                    >
                        <div className="user-avatar tech-avatar">
                            {user?.prenom?.[0] || 'T'}{user?.nom?.[0] || 'E'}
                        </div>
                        {isOpen && (
                            <div className="user-details">
                                <p className="user-name">{user?.prenom} {user?.nom}</p>
                                <p className="user-email">{user?.email}</p>
                            </div>
                        )}
                    </button>

                    <button 
                        className="sidebar-logout"
                        onClick={handleLogout}
                        title="Déconnexion"
                    >
                        <LogOut size={20} />
                        {isOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
        </>
    )
}