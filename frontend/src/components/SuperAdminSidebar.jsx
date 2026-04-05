import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, LogOut, Wrench, Crown, Users } from 'lucide-react'
import logo from '../assets/logo.png'
import './AdminSidebar.css'

/**
 * Même gabarit visuel que la sidebar admin (logo, items, profil, déconnexion).
 */
export default function SuperAdminSidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(true)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const path = location.pathname

    return (
        <>
            <button
                type="button"
                className="sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Ouvrir ou fermer le menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Logo" className="sidebar-brand-logo" />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-item">
                        <button
                            type="button"
                            className={`sidebar-link ${path === '/admin' ? 'active' : ''}`}
                            onClick={() => navigate('/admin')}
                        >
                            <LayoutDashboard size={20} />
                            {isOpen && <span>Tableau de bord</span>}
                        </button>
                    </div>
                    <div className="sidebar-item">
                        <button
                            type="button"
                            className={`sidebar-link ${path === '/admin/reclamations' ? 'active' : ''}`}
                            onClick={() => navigate('/admin/reclamations')}
                        >
                            <Wrench size={20} />
                            {isOpen && <span>Réclamations</span>}
                        </button>
                    </div>
                    <div className="sidebar-item">
                        <button
                            type="button"
                            className={`sidebar-link ${path === '/superadmin' ? 'active' : ''}`}
                            onClick={() => navigate('/superadmin')}
                        >
                            <Crown size={20} />
                            {isOpen && <span>Administrateurs</span>}
                        </button>
                    </div>
                    <div className="sidebar-item">
                        <button
                            type="button"
                            className={`sidebar-link ${path === '/superadmin/equipe' ? 'active' : ''}`}
                            onClick={() => navigate('/superadmin/equipe')}
                        >
                            <Users size={20} />
                            {isOpen && <span>Techniciens</span>}
                        </button>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button
                        type="button"
                        className="sidebar-user-info"
                        onClick={() => navigate('/profile')}
                        title={`${user?.prenom || ''} ${user?.nom || ''}`}
                    >
                        <div className="user-avatar admin-avatar">
                            {user?.prenom?.[0] || 'S'}
                            {user?.nom?.[0] || 'A'}
                        </div>
                        {isOpen && (
                            <div className="user-details">
                                <p className="user-name">
                                    {user?.prenom} {user?.nom}
                                </p>
                                <p className="user-role">Super administrateur</p>
                            </div>
                        )}
                    </button>

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                        title="Déconnexion"
                    >
                        <LogOut size={20} />
                        {isOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {isOpen && (
                <div
                    className="sidebar-overlay"
                    role="presentation"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
