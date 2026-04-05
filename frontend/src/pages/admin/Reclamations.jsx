import { useState, useEffect, useMemo } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import SuperAdminSidebar from '../../components/SuperAdminSidebar'
import { X } from 'lucide-react'
import './Reclamations.css'

export default function AdminReclamations() {
    const { user } = useAuth()
    const readOnlySuperAdmin = user?.role === 'superadmin'
    const [reclamations, setReclamations] = useState([])
    const [loading, setLoading] = useState(false)
    const [filtre, setFiltre] = useState('')
    const [techniciens, setTechniciens] = useState([])
    const [selectedRec, setSelectedRec] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState('')
    const [filterVille, setFilterVille] = useState('')
    const [filterPriorite, setFilterPriorite] = useState('')
    const [filterDateDebut, setFilterDateDebut] = useState('')
    const [filterDateFin, setFilterDateFin] = useState('')
    const [showHistorique, setShowHistorique] = useState(false)
    const [historique, setHistorique] = useState([])
    const [selectedRecRef, setSelectedRecRef] = useState('')

    const filters = useMemo(() => ({
        statut: filtre,
        ville: filterVille,
        priorite: filterPriorite,
        date_debut: filterDateDebut,
        date_fin: filterDateFin
    }), [filtre, filterVille, filterPriorite, filterDateDebut, filterDateFin])

    const buildParams = (filters) => {
        return Object.fromEntries(
            Object.entries(filters).filter(([key, value]) => value)
        )
    }

    const fetchReclamations = async () => {
        try {
            const res = await api.get("/reclamations", {
                params: buildParams(filters)
            })
            return res.data.data
        } catch (err) {
            console.error(err)
            return []
        }
    }

    useEffect(() => {
        const loadReclamations = async () => {
            try {
                setLoading(true)
                const data = await fetchReclamations()
                setReclamations(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadReclamations()
    }, [filters])

    const fetchTechniciens = async () => {
        try {
            const res = await api.get('/users/techniciens')
            setTechniciens(res.data.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleAssign = async (technicien_id) => {
        try {
            await api.put(`/reclamations/${selectedRec}/assign`, { technicien_id })
            setShowModal(false)
            setSelectedRec(null)
            const data = await fetchReclamations()
            setReclamations(data)
        } catch (err) {
            console.error(err)
        }
    }

    const openModal = (recId) => {
        setSelectedRec(recId)
        fetchTechniciens()
        setShowModal(true)
    }

    const openHistorique = async (id, reference) => {
        try {
            const res = await api.get(`/reclamations/${id}/historique`)
            setHistorique(res.data.data)
            setSelectedRecRef(reference)
            setShowHistorique(true)
        } catch (err) {
            console.error(err)
        }
    }

    const getStatutColor = (statut) => {
        const colors = {
            en_attente: '#f39c12',
            assignee: '#3498db',
            en_cours: '#9b59b6',
            resolue: '#27ae60',
            fermee: '#95a5a6',
            annulee: '#e74c3c'
        }
        return colors[statut] || '#888'
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Date invalide'
        try {
            const dateObj = new Date(dateStr)
            if (isNaN(dateObj.getTime())) return 'Date invalide'
            return dateObj.toLocaleString('fr-FR')
        } catch (e) {
            return 'Date invalide'
        }
    }

    return (
        <div className="reclamations-container">
            {user?.role === 'superadmin' ? <SuperAdminSidebar /> : <AdminSidebar />}

            <div className="reclamations-main">
                <div className="reclamations-header">
                    <h1 className="reclamations-title">Gestion des Reclamations</h1>
                </div>

                {readOnlySuperAdmin && (
                    <div className="reclamations-readonly-banner" role="status">
                        <strong>Consultation seule.</strong> Vous visualisez les mêmes données que les
                        administrateurs opérationnels. Pour assigner des techniciens ou agir sur les dossiers,
                        seul un <strong>administrateur</strong> peut le faire. La gestion des comptes (admins,
                        techniciens, clients) reste dans <strong>Super admin</strong> (Administrateurs /
                        Techniciens &amp; clients).
                    </div>
                )}

                <div className="filters-card">
                    <div className="filtres">
                        {['', 'en_attente', 'assignee', 'en_cours', 'resolue', 'fermee'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFiltre(s)}
                                className={`btn-filtre ${filtre === s ? 'active' : ''}`}
                            >
                                {s === '' ? 'Tous' : s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="filtres-avances">
                        <input type="text" placeholder="Ville..." value={filterVille} onChange={(e) => setFilterVille(e.target.value)} className="filter-input"/>
                        <select value={filterPriorite} onChange={(e) => setFilterPriorite(e.target.value)} className="filter-select">
                            <option value="">Toutes priorites</option>
                            <option value="normale">Normale</option>
                            <option value="urgente">Urgente</option>
                        </select>
                        <input type="date" value={filterDateDebut} onChange={(e) => setFilterDateDebut(e.target.value)} className="filter-input"/>
                        <input type="date" value={filterDateFin} onChange={(e) => setFilterDateFin(e.target.value)} className="filter-input"/>
                        
                        <button onClick={() => {
                            setFilterVille('')
                            setFilterPriorite('')
                            setFilterDateDebut('')
                            setFilterDateFin('')
                            setFiltre('')
                            setSearch('')
                        }}
                        className="btn-reset">
                            <X size={18} /> Reinitialiser
                        </button>
                    </div>

                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Rechercher par reference, client, ville..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="rec-table">
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Client</th>
                                    <th>Appareil</th>
                                    <th>Ville</th>
                                    <th>Statut</th>
                                    <th>Priorite</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reclamations.filter(r =>
                                    r.reference?.toLowerCase().includes(search.toLowerCase()) ||
                                    r.client_nom?.toLowerCase().includes(search.toLowerCase()) ||
                                    r.ville_intervention?.toLowerCase().includes(search.toLowerCase())
                                )
                                .map(r => (
                                    <tr key={r.id}>
                                        <td><strong>{r.reference}</strong></td>
                                        <td>{r.client_nom}</td>
                                        <td>{r.marque} {r.modele}</td>
                                        <td>{r.ville_intervention}</td>
                                        <td>
                                            <span className="badge" style={
                                                r.statut === 'en_attente' ? { background: '#FEF3E2', color: '#B06E10' } :
                                                r.statut === 'assignee' ? { background: '#E6F7F6', color: '#0A7269' } :
                                                r.statut === 'en_cours' ? { background: '#FEF3E2', color: '#B06E10' } :
                                                r.statut === 'resolue' ? { background: '#E6F7F2', color: '#1A8C6A' } :
                                                r.statut === 'fermee' ? { background: '#EEF0F3', color: '#6B7685' } :
                                                { background: '#EEF0F3', color: '#6B7685' }
                                            }>
                                                {r.statut.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge" style={
                                                r.priorite === 'urgente' ? { background: '#FEF0E6', color: '#B85500' } :
                                                { background: '#EEF0F3', color: '#6B7685' }
                                            }>
                                                {r.priorite}
                                            </span>
                                        </td>
                                        <td>{new Date(r.date_reclamation).toLocaleDateString('fr-FR')}</td>
                                        <td className="actions-cell">
                                            {r.statut === 'en_attente' && !readOnlySuperAdmin && (
                                                <button type="button" onClick={() => openModal(r.id)} className="btn-assign">
                                                    Assigner
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openHistorique(r.id, r.reference)}
                                                className="btn-historique"
                                            >
                                                Historique
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reclamations.length === 0 && (
                                    <tr><td colSpan="8" className="text-center py-4">Aucune reclamations trouvee</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Assigner un technicien */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content assign-modal">
                        <div className="modal-header">
                            <h3>Assigner un technicien</h3>
                            <button onClick={() => setShowModal(false)} className="close-btn">x</button>
                        </div>
                        <div className="techniciens-list">
                            {techniciens.map(t => (
                                <button key={t.id} onClick={() => handleAssign(t.id)} className="tech-card">
                                    <div className="tech-avatar">{t.prenom?.[0]}{t.nom?.[0]}</div>
                                    <div className="tech-info">
                                        <h4>{t.nom} {t.prenom}</h4>
                                        <span>{t.ville}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Historique */}
            {showHistorique && (
                <div className="modal-overlay">
                    <div className="modal-content hist-modal">
                        <div className="modal-header">
                            <h3>Historique - {selectedRecRef}</h3>
                            <button onClick={() => setShowHistorique(false)} className="close-btn">x</button>
                        </div>
                        {historique && historique.length > 0 ? (
                            <div className="timeline">
                                {historique.map((h, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className="tl-date">{formatDate(h.date_changement)}</div>
                                        <div className="status-change">
                                            <span className="badge" style={{background: getStatutColor(h.ancien_statut)}}>{h.ancien_statut.replace('_', ' ')}</span>
                                            <span className="arrow">→</span>
                                            <span className="badge" style={{background: getStatutColor(h.nouveau_statut)}}>{h.nouveau_statut.replace('_', ' ')}</span>
                                        </div>
                                        {(h.modifie_par_nom || h.modifie_par_role) && (
                                            <div className="tl-content">
                                                <strong>Par:</strong> {h.modifie_par_nom || 'Utilisateur'} ({h.modifie_par_role || 'Admin'})
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-history">Aucun historique disponible</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
