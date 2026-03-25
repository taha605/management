import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Home, ClipboardList, LogOut } from 'lucide-react'
import logo from '../assets/logo.png'
import './ClientSidebar.css'

export default function ClientSidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(true)
    const [expandedMenu, setExpandedMenu] = useState(null)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const toggleExpanded = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu)
    }

    const isActive = (path) => {
        return location.pathname === path
    }

    return (
        <>
            {/* Toggle Button */}
            <button 
                className="sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle sidebar"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`client-sidebar ${isOpen ? 'open' : 'closed'}`}>
                {/* Logo Section */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Logo" className="sidebar-brand-logo" />
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="sidebar-nav">
                    {/* Dashboard Item */}
                    <div className="sidebar-item">
                        <button 
                            className={`sidebar-link ${isActive('/dashboard-client') ? 'active' : ''}`}
                            onClick={() => navigate('/dashboard-client')}
                        >
                            <Home size={20} />
                            {isOpen && <span>Tableau de Bord</span>}
                        </button>
                    </div>

                    {/* Reclamations Item */}
                    <div className="sidebar-item">
                        <button 
                            className={`sidebar-link ${isActive('/reclamations-client') ? 'active' : ''}`}
                            onClick={() => navigate('/reclamations-client')}
                        >
                            <ClipboardList size={20} />
                            {isOpen && <span>Mes Réclamations</span>}
                        </button>
                    </div>
                </nav>

                {/* User Section */}
                <div className="sidebar-footer">
                    <button 
                        className="sidebar-user-info"
                        onClick={() => navigate('/profile')}
                        title={user?.prenom + ' ' + user?.nom}
                    >
                        <div className="user-avatar">
                            {user?.prenom?.[0]}{user?.nom?.[0]}
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

            {/* Sidebar Overlay (on mobile) */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
        </>
    )
}
