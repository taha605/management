import { useState, useEffect } from 'react'
import api from '../../services/api'
import SuperAdminSidebar from '../../components/SuperAdminSidebar'
import './Dashboard.css'

export default function SuperAdminDashboard() {
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const res = await api.get('/users/admins')
                setAdmins(res.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAdmins()
    }, [])

    const formatDate = (d) => {
        if (!d) return '—'
        try {
            return new Date(d).toLocaleString('fr-FR')
        } catch {
            return '—'
        }
    }

    return (
        <div className="sa-page-layout">
            <SuperAdminSidebar />

            <div className="sa-main sa-main--with-sidebar">
                <div className="sa-header sa-header--readonly">
                    <div>
                        <h1 className="sa-title">Administrateurs</h1>
                        <p className="sa-readonly-hint">
                            Consultation des informations — aucune modification n&apos;est possible depuis ce
                            compte.
                        </p>
                    </div>
                </div>

                <div className="sa-readonly-banner-inline" role="status">
                    Vue détaillée : coordonnées et statut de chaque administrateur (lecture seule).
                </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="sa-table sa-table--readonly">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Ville</th>
                                    <th>Statut</th>
                                    <th>Créé le</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((a) => (
                                    <tr key={a.id}>
                                        <td>
                                            {a.prenom} {a.nom}
                                        </td>
                                        <td>{a.email}</td>
                                        <td>{a.telephone || '—'}</td>
                                        <td>{a.ville || '—'}</td>
                                        <td>
                                            <span
                                                className={`badge ${a.is_active ? 'badge-active' : 'badge-inactive'}`}
                                            >
                                                {a.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td>{formatDate(a.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {admins.length === 0 && <div className="empty">Aucun administrateur</div>}
                    </div>
                )}
            </div>
        </div>
    )
}
