import { useState, useEffect } from 'react'
import ClientSidebar from '../../components/ClientSidebar'
import api from '../../services/api'
import { Calendar, Plus, X } from 'lucide-react'
import './ReclamationsList.css'

export default function ReclamationsList() {
    const [reclamations, setReclamations] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [form, setForm] = useState({
        marque: '', modele: '', description_panne: '',
        adresse_intervention: '', ville_intervention: '', priorite: 'normale'
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    useEffect(() => {
        fetchReclamations()
    }, [])

    const fetchReclamations = async () => {
        try {
            const res = await api.get('/reclamations/my')
            setReclamations(res.data.data)
            setCurrentPage(1)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const openForm = () => {
        setShowForm(true)
        setCurrentStep(1)
        setError('')
        setSuccess('')
    }

    const closeForm = () => {
        setShowForm(false)
        setCurrentStep(1)
        setForm({ marque: '', modele: '', description_panne: '', adresse_intervention: '', ville_intervention: '', priorite: 'normale' })
        setError('')
    }

    const nextStep = () => {
        if (currentStep === 1) {
            if (!form.marque || !form.description_panne) {
                setError('Veuillez remplir tous les champs requis')
                return
            }
            setError('')
            setCurrentStep(2)
        } else if (currentStep === 2) {
            if (!form.adresse_intervention || !form.ville_intervention) {
                setError('Veuillez remplir tous les champs requis')
                return
            }
            setError('')
            setCurrentStep(3)
        } else if (currentStep === 3) {
            setError('')
            setCurrentStep(4)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            setError('')
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && currentStep < 4) {
            e.preventDefault()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSubmitting(true)
        try {
            const res = await api.post('/reclamations', form)
            setForm({ marque: '', modele: '', description_panne: '', adresse_intervention: '', ville_intervention: '', priorite: 'normale' })
            setSubmitting(false)
            closeForm()
            setSuccess(`Réclamation créée: ${res.data.data.reference}`)
            fetchReclamations()
            setTimeout(() => setSuccess(''), 4000)
        } catch (err) {
            setSubmitting(false)
            setError(err.response?.data?.message || 'Erreur lors de la création')
        }
    }

    const formatStatus = (statut) => {
        const statusMap = {
            'en_attente': 'En attente',
            'assignee': 'Assignée',
            'en_cours': 'En cours',
            'resolue': 'Résolue',
            'fermee': 'Fermée',
            'annulee': 'Annulée'
        }
        return statusMap[statut] || statut
    }

    const formatPriority = (priorite) => {
        const priorityMap = {
            'normale': 'Normale',
            'urgente': 'Urgente'
        }
        return priorityMap[priorite] || priorite
    }

    const totalPages = Math.ceil(reclamations.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedReclamations = reclamations.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="reclamations-container">
            <ClientSidebar />

            <div className="reclamations-main">
                <div className="reclamations-header">
                    <h1 className="reclamations-title">Mes Réclamations</h1>
                    <button onClick={openForm} className="btn-new-reclamation">
                        <Plus size={20} /> Nouvelle Réclamation
                    </button>
                </div>

                {success && <div className="alert-success">{success}</div>}
                {error && !showForm && <div className="alert-error">{error}</div>}

                {/* Form Card - Stepped Style Modal */}
                {showForm && (
                    <div className="modal-overlay" onClick={closeForm}>
                        <div className="form-card" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close-btn" onClick={closeForm} disabled={submitting}>
                                <X size={18} />
                            </button>

                            {/* Progress Indicator - Dot Trail */}
                            <div className="progress-dots">
                                {[1, 2, 3, 4].map((step) => (
                                    <div
                                        key={step}
                                        className={`progress-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                                    />
                                ))}
                            </div>

                            {/* Step Header */}
                            <div className="step-header">
                                <h2 className="step-header-title">
                                    {currentStep === 1 && "Informations de l'appareil"}
                                    {currentStep === 2 && "Localisation de l'intervention"}
                                    {currentStep === 3 && "Vérifier vos informations"}
                                    {currentStep === 4 && "Confirmer l'envoi"}
                                </h2>
                                <p className="step-header-subtitle">
                                    Step {currentStep} of 4 — 
                                    {currentStep === 1 && " Appareil"}
                                    {currentStep === 2 && " Localisation"}
                                    {currentStep === 3 && " Vérification"}
                                    {currentStep === 4 && " Confirmation"}
                                </p>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="form-card-body">
                                {error && <div className="form-error">{error}</div>}

                                {/* Step 1: Device Information */}
                                {currentStep === 1 && (
                                    <div className="step-content">
                                        <div className="form-group">
                                            <label className="form-label">Marque *</label>
                                            <input
                                                type="text"
                                                name="marque"
                                                placeholder="Samsung, Apple, Huawei..."
                                                value={form.marque}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Modèle</label>
                                            <input
                                                type="text"
                                                name="modele"
                                                placeholder="S21, 13 Pro, P40..."
                                                value={form.modele}
                                                onChange={handleChange}
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Description de la panne *</label>
                                            <textarea
                                                name="description_panne"
                                                placeholder="Décrivez le problème..."
                                                value={form.description_panne}
                                                onChange={handleChange}
                                                required
                                                className="form-textarea"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Location */}
                                {currentStep === 2 && (
                                    <div className="step-content">
                                        <div className="form-group">
                                            <label className="form-label">Adresse *</label>
                                            <input
                                                type="text"
                                                name="adresse_intervention"
                                                placeholder="123 Rue de la Paix..."
                                                value={form.adresse_intervention}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Ville *</label>
                                            <input
                                                type="text"
                                                name="ville_intervention"
                                                placeholder="Rabat"
                                                value={form.ville_intervention}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Priorité</label>
                                            <select
                                                name="priorite"
                                                value={form.priorite}
                                                onChange={handleChange}
                                                className="form-select"
                                            >
                                                <option value="normale">Normale</option>
                                                <option value="urgente">Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Review */}
                                {currentStep === 3 && (
                                    <div className="step-content">
                                        <div className="review-section">
                                            <h3 className="review-title">Appareil</h3>
                                            <p className="review-item"><strong>Marque:</strong> {form.marque}</p>
                                            {form.modele && <p className="review-item"><strong>Modèle:</strong> {form.modele}</p>}
                                            <p className="review-item"><strong>Panne:</strong> {form.description_panne}</p>
                                        </div>

                                        <div className="review-section">
                                            <h3 className="review-title">Localisation</h3>
                                            <p className="review-item"><strong>Adresse:</strong> {form.adresse_intervention}</p>
                                            <p className="review-item"><strong>Ville:</strong> {form.ville_intervention}</p>
                                            <p className="review-item"><strong>Priorité:</strong> <span className={`priority-badge ${form.priorite}`}>{form.priorite}</span></p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Final Confirmation */}
                                {currentStep === 4 && (
                                    <div className="step-content">
                                        <p className="confirmation-text">Tous vos informations sont correctes ?</p>
                                        
                                        <div className="review-section">
                                            <h3 className="review-title">Appareil</h3>
                                            <p className="review-item"><strong>{form.marque}</strong> {form.modele && `(${form.modele})`}</p>
                                            <p className="review-description">{form.description_panne}</p>
                                        </div>

                                        <div className="review-section">
                                            <h3 className="review-title">Localisation</h3>
                                            <p className="review-item">{form.adresse_intervention}, {form.ville_intervention}</p>
                                            <p className="review-item"><strong>Priorité:</strong> <span className={`priority-badge ${form.priorite}`}>{form.priorite}</span></p>
                                        </div>
                                    </div>
                                )}

                                {/* Form Buttons */}
                                <div className="form-buttons">
                                    {currentStep < 4 ? (
                                        <button type="button" onClick={nextStep} className="btn-primary" disabled={submitting}>
                                            Next →
                                        </button>
                                    ) : (
                                        <button type="submit" className="btn-primary" disabled={submitting}>
                                            Submit
                                        </button>
                                    )}
                                </div>

                                {currentStep > 1 && (
                                    <button type="button" onClick={prevStep} className="btn-back" disabled={submitting}>
                                        ← Back
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {loading ? <div className="loading">Chargement...</div> : (
                    <div className="reclamations-table-wrap">
                        {reclamations.length === 0 ? (
                            <div className="empty">Aucune réclamation — cliquez sur "+ Nouvelle Réclamation"</div>
                        ) : (
                            <>
                                <div className="table-head">
                                    <h2 className="table-title">Liste des réclamations</h2>
                                    <span className="table-count">{reclamations.length} réclamation(s)</span>
                                </div>

                                <div className="table-responsive">
                                    <table className="reclamations-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Référence</th>
                                                <th scope="col">Appareil</th>
                                                <th scope="col">Panne</th>
                                                <th scope="col">Ville</th>
                                                <th scope="col">Statut</th>
                                                <th scope="col">Priorité</th>
                                                <th scope="col">Date</th>
                                                <th scope="col">Technicien</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedReclamations.map(r => (
                                                <tr key={r.id}>
                                                    <td className="cell-ref">{r.reference}</td>
                                                    <td>
                                                        <div className="cell-device">{r.marque}</div>
                                                        <div className="cell-device-model">{r.modele || '-'}</div>
                                                    </td>
                                                    <td className="cell-description" title={r.description_panne}>{r.description_panne}</td>
                                                    <td className="cell-city">{r.ville_intervention}</td>
                                                    <td>
                                                        <span className={`status-badge rec-${r.statut}`}>
                                                            {formatStatus(r.statut)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {r.priorite ? (
                                                            <span className={`priority-badge-table ${r.priorite}`}>
                                                                {formatPriority(r.priorite)}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="cell-date">
                                                        <Calendar size={13} /> {new Date(r.date_reclamation).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="cell-tech">{r.technicien_nom || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ← Précédent
                                    </button>
                                    <span className="pagination-info">
                                        Page {currentPage} sur {totalPages} — {startIndex + 1}–{Math.min(startIndex + itemsPerPage, reclamations.length)} de {reclamations.length}
                                    </span>
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Suivant →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
