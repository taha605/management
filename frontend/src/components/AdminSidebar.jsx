import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Users, LogOut, Wrench } from 'lucide-react'
import logo from '../assets/logo.png'
import './AdminSidebar.css'

export default function AdminSidebar() {
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

            <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>   
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Logo" className="sidebar-brand-logo" />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-item">
                        <button
                            className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
                            onClick={() => navigate('/admin')}
                        >
                            <LayoutDashboard size={20} />
                            {isOpen && <span>Tableau de Bord</span>}
                        </button>
                    </div>
                    <div className="sidebar-item">
                        <button
                            className={`sidebar-link ${isActive('/admin/reclamations') ? 'active' : ''}`}
                            onClick={() => navigate('/admin/reclamations')}
                        >
                            <Wrench size={20} />
                            {isOpen && <span>Réclamations</span>}
                        </button>
                    </div>
                    <div className="sidebar-item">
                        <button
                            className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
                            onClick={() => navigate('/admin/users')}
                        >
                            <Users size={20} />
                            {isOpen && <span>Utilisateurs</span>}
                        </button>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="sidebar-user-info"
                        onClick={() => navigate('/profile')}
                        title={user?.prenom + ' ' + user?.nom}
                    >
                        <div className="user-avatar admin-avatar">
                            {user?.prenom?.[0] || 'A'}{user?.nom?.[0] || 'D'}   
                        </div>
                        {isOpen && (
                            <div className="user-details">
                                <p className="user-name">{user?.prenom} {user?.nom}</p>
                                <p className="user-role">Administrateur</p>     
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