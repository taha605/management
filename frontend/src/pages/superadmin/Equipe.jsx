import { useState, useEffect, useMemo } from 'react'
import api from '../../services/api'
import SuperAdminSidebar from '../../components/SuperAdminSidebar'
import '../admin/Users.css'
import './Dashboard.css'

/**
 * Liste des techniciens — informations complètes, lecture seule pour le super admin.
 */
export default function SuperAdminEquipe() {
    const [techniciens, setTechniciens] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/users/techniciens')
                setTechniciens(res.data.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = useMemo(() => {
        const q = searchTerm.toLowerCase()
        return techniciens.filter(
            (t) =>
                `${t.prenom} ${t.nom}`.toLowerCase().includes(q) ||
                (t.email && t.email.toLowerCase().includes(q)) ||
                (t.ville && t.ville.toLowerCase().includes(q))
        )
    }, [techniciens, searchTerm])

    const formatDate = (d) => {
        if (!d) return '—'
        try {
            return new Date(d).toLocaleString('fr-FR')
        } catch {
            return '—'
        }
    }

    return (
        <div className="users-container">
            <SuperAdminSidebar />

            <div className="users-main">
                <div className="users-header">
                    <div>
                        <h1 className="users-title">Techniciens</h1>
                        <p className="sa-equipe-subtitle">
                            Consultation des informations de chaque technicien — lecture seule, sans modification.
                        </p>
                    </div>
                </div>

                <div className="sa-readonly-banner-inline" role="status">
                    Tous les comptes techniciens (actifs ou non) — coordonnées visibles à titre informatif.
                </div>

                <div className="filters-section">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email ou ville..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Nom et prénom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Ville</th>
                                    <th>Statut</th>
                                    <th>Créé le</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length > 0 ? (
                                    filtered.map((t) => (
                                        <tr key={t.id}>
                                            <td>
                                                <div className="user-info">
                                                    <div className="user-avatar">
                                                        {t.prenom?.[0]}
                                                        {t.nom?.[0]}
                                                    </div>
                                                    <div className="user-details">
                                                        <strong>
                                                            {t.prenom} {t.nom}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{t.email}</td>
                                            <td>{t.telephone || '—'}</td>
                                            <td>{t.ville || '—'}</td>
                                            <td>
                                                <span
                                                    className={`badge ${t.is_active ? 'badge-active' : 'badge-inactive'}`}
                                                >
                                                    {t.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td>{formatDate(t.created_at)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center empty-state">
                                            Aucun technicien trouvé
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
