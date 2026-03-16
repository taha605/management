import { useNavigate , Link} from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useEffect, useState , useMemo} from "react"
import api from '../../services/api'
import './Dashboard.css'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Wrench, User, Users, Building2, X, Search } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function AdminDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [reclamations, setReclamations] = useState([])
    const [loading, setLoading] = useState(false)
    const [filtre, setFiltre] = useState('')
    const [stats, setStats] = useState(null)
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
     // group filters
  const filters = useMemo(() => ({
    statut: filtre,
    ville: filterVille,
    priorite: filterPriorite,
    date_debut: filterDateDebut,
    date_fin: filterDateFin
  }), [filtre, filterVille, filterPriorite, filterDateDebut, filterDateFin])


  // remove empty filters
  const buildParams = (filters) => {
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value)
    )
  }


  // fetch reclamations
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


  // fetch stats
  const fetchStats = async () => {
    try {

      const res = await api.get("/reclamations/stats")
      return res.data.data

    } catch (err) {
      console.error(err)
      return null
    }
  }


  // load stats once
  useEffect(() => {

    const loadStats = async () => {
      const statsData = await fetchStats()
      setStats(statsData)
    }

    loadStats()

  }, [])


  // load reclamations when filters change
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
            fetchReclamations()
            fetchStats()
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

const pieData = {
    labels: ['En attente', 'En cours', 'Résolues', 'Assignées'],
    datasets: [{
        data: [
            stats?.en_attente || 0,
            stats?.en_cours || 0,
            stats?.resolues || 0,
            stats?.assignees || 0
        ],
        backgroundColor: ['#f39c12', '#9b59b6', '#27ae60', '#3498db'],
        borderWidth: 0
    }]
}

const barData = {
    labels: ['Total', 'En attente', 'En cours', 'Résolues'],
    datasets: [{
        label: 'Réclamations',
        data: [
            stats?.total || 0,
            stats?.en_attente || 0,
            stats?.en_cours || 0,
            stats?.resolues || 0
        ],
        backgroundColor: ['#667eea', '#f39c12', '#9b59b6', '#27ae60'],
        borderRadius: 8,
        borderWidth: 0
    }]
}

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const getStatutColor = (statut) => {
        const colors={
            en_attente: '#f39c12',
            assignee: '#3498db',
            en_cours: '#9b59b6',
            resolue: '#27ae60',
            fermee: '#95a5a6',
            annulee: '#e74c3c' 
        }
        return colors[statut] || '#888'
    }

    return(
        <div className="admin-container">
            
            <nav className="admin-nav">
                <div className="nav-brand"><Wrench /> ReclamationPro</div>
                <div className="nav-right">
                    
                    <span className="nav-user"><User /> {user?.prenom} {user?.nom}</span>
                    <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
                    <Link to="/admin/users" style={{color:'white', textDecoration:'none', fontSize:'14px', fontWeight:'600'}}><Users /> Utilisateurs</Link>
                    <Link to="/profile" className="nav-link"><User /> Profil</Link>
                </div>
            </nav>

            
            <div className="admin-main">
                <h1 className="admin-title">Tableau de bord Admin</h1>
                {stats && (
    <div className="stats-grid">
        <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
        </div>
        <div className="stat-card stat-orange">
            <div className="stat-number">{stats.en_attente}</div>
            <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card stat-blue">
            <div className="stat-number">{stats.en_cours}</div>
            <div className="stat-label">En cours</div>
        </div>
        <div className="stat-card stat-green">
            <div className="stat-number">{stats.resolues}</div>
            <div className="stat-label">Résolues</div>
        </div>
        {stats && (
    <div className="charts-grid">
        <div className="chart-card">
            <h3 className="chart-title">Répartition par statut</h3>
            <div className="chart-pie">
                <Pie data={pieData} options={{ plugins: { legend: { labels: { color: '#ccc' } } } }} />
            </div>
        </div>
        <div className="chart-card">
            <h3 className="chart-title">Vue générale</h3>
            <Bar data={barData} options={{
                plugins: { legend: { labels: { color: '#ccc' } } },
                scales: {
                    x: { ticks: { color: '#aaa' }, grid: { color: '#ffffff10' } },
                    y: { ticks: { color: '#aaa' }, grid: { color: '#ffffff10' } }
                }
            }} />
        </div>
    </div>
)}
    </div>
)}

                
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
                    <select value={filterPriorite} onChange={(e) => setFilterPriorite(e.target.value)} className="filter-select" >
                        <option value="">Toutes priorités</option>
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
                    className="btn-reset" >
                        <X /> Reset
                    </button>
                </div>
                <div className="search-bar">
                <input
                    type="text"
                    placeholder="Rechercher par référence, client, ville..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                    />
                    </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="rec-table">
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Client</th>
                                    <th>Appareil</th>
                                    <th>Ville</th>
                                    <th>Statut</th>
                                    <th>Priorité</th>
                                    <th>Date</th>
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
                                            <span className="badge" style={{background: getStatutColor(r.statut)}}>
                                                {r.statut.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${r.priorite === 'urgente' ? 'badge-urgent' : 'badge-normal'}`}>
                                                {r.priorite}
                                            </span>
                                        </td>
                                        <td>{new Date(r.date_reclamation).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            {r.statut === 'en_attente' && (
                                                <button onClick={() => openModal(r.id)} className="btn-assign">Assigner</button>)}</td>
                                        <td>
                                            {r.statut === 'en_attente' && (
                                                <button onClick={() => openModal(r.id)} className="btn-assign">Assigner</button>
                                                )}
                                                <button onClick={() => openHistorique(r.id, r.reference)} className="btn-historique">Historique</button>
                                                
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {reclamations.length === 0 && (
                            <div className="empty">Aucune réclamation trouvée</div>
                        )}
                    </div>
                )}
            </div>
            {showModal && (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Choisir un technicien</h3>
            <div className="tech-list">
                {techniciens.map(t => (
                    <div key={t.id} className="tech-item" onClick={() => handleAssign(t.id)}>
                        <strong>{t.prenom} {t.nom}</strong>
                        <span>{t.email}</span>
                    </div>
                ))}
            </div>
            <button onClick={() => setShowModal(false)} className="btn-cancel">Annuler</button>
        </div>
    </div>
    )}
    {showHistorique && (
    <div className="modal-overlay" onClick={() => setShowHistorique(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Historique — {selectedRecRef}</h3>
            <div className="historique-list">
                {historique.length === 0 ? (
                    <div className="empty">Aucun historique</div>
                ) : (
                    historique.map((h, i) => (
                        <div key={i} className="historique-item">
                            <div className="historique-statut">
                                <span>{h.ancien_statut || '—'}</span>
                                <span className="arrow">→</span>
                                <span className="new-statut">{h.nouveau_statut}</span>
                            </div>
                            <div className="historique-info">
                                <span>👤 {h.prenom} {h.nom} ({h.role})</span>
                               <span>📅 {new Date(h.created_at).toLocaleString('fr-FR')}</span>
                            </div>
                            {h.commentaire && <div className="historique-comment">💬 {h.commentaire}</div>}
                        </div>
                    ))
                )}
            </div>
            <button onClick={() => setShowHistorique(false)} className="btn-cancel">Fermer</button>
        </div>
    </div>
)}
        </div>
    )
}