
const express = require('express')
const router = express.Router()
const db = require('../config/db')
const { verifyToken, isAdmin, isAdminOrSuperAdmin, isSuperAdmin, forbidSuperAdmin } = require('../middleware/auth.middleware')

/** Interdit modifier / désactiver un compte superadmin (réservé aux admins opérationnels si activé) */
async function forbidSuperadminTarget(req, res, next) {
    try {
        const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [req.params.id])
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' })
        }
        if (rows[0].role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Impossible de modifier un compte superadmin'
            })
        }
        next()
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
}

/**
 * Liste techniciens :
 * - admin : actifs seulement (affectation)
 * - super admin : tous les techniciens + infos complètes (lecture seule côté métier)
 */
router.get('/techniciens', verifyToken, isAdminOrSuperAdmin, async (req, res) => {
    try {
        if (req.user.role === 'superadmin') {
            const [rows] = await db.query(
                `SELECT id, nom, prenom, email, telephone, ville, is_active, created_at
                 FROM users WHERE role = 'technicien' ORDER BY created_at DESC`
            )
            return res.json({ success: true, data: rows })
        }
        const [rows] = await db.query(
            'SELECT id, nom, prenom, email, telephone FROM users WHERE role = ? AND is_active = ?',
            ['technicien', true]
        )
        res.json({ success: true, data: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

/** Vue détaillée administrateurs — super admin (lecture seule, pas de modification via ces données) */
router.get('/admins', verifyToken, isSuperAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, nom, prenom, email, telephone, ville, is_active, created_at
             FROM users WHERE role = 'admin' ORDER BY created_at DESC`
        )
        res.json({ success: true, data: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

/** Création admin : désactivée depuis l’API (le super admin ne fait que consulter) */
router.post('/admins', verifyToken, forbidSuperAdmin, (req, res) => {
    res.status(403).json({
        success: false,
        message:
            'Création d’administrateurs indisponible depuis l’application. Consultation uniquement pour le super administrateur.'
    })
})

router.put('/admins/:id/toggle', verifyToken, forbidSuperAdmin, (req, res) => {
    res.status(403).json({
        success: false,
        message: 'Modification non autorisée depuis ce compte.'
    })
})

router.delete('/admins/:id', verifyToken, forbidSuperAdmin, (req, res) => {
    res.status(403).json({
        success: false,
        message: 'Suppression non autorisée depuis ce compte.'
    })
})

router.delete('/techniciens/:id', verifyToken, forbidSuperAdmin, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [req.params.id])
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' })
        }
        if (rows[0].role !== 'technicien') {
            return res.status(400).json({ success: false, message: 'Cible invalide' })
        }
        const [delResult] = await db.query('DELETE FROM users WHERE id = ? AND role = ?', [
            req.params.id,
            'technicien'
        ])
        if (delResult.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Technicien introuvable' })
        }
        res.json({ success: true, message: 'Technicien supprimé' })
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer : des réclamations sont encore liées à ce technicien'
            })
        }
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

/** Super admin : vue d’ensemble (sans mot de passe) */
router.get('/', verifyToken, isSuperAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, nom, prenom, email, telephone, ville, role, is_active, created_at
             FROM users ORDER BY created_at DESC`
        )
        res.json({ success: true, data: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

/** Création technicien (ou client) : admin opérationnel uniquement — pas le super admin */
router.post('/', verifyToken, forbidSuperAdmin, isAdmin, async (req, res) => {
    try {
        const { nom, prenom, email, password, telephone, ville, role } = req.body
        if (!nom || !prenom || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Champs manquants' })
        }
        if (!['client', 'technicien'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rôle autorisé : client ou technicien'
            })
        }
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.query(
            'CALL sp_register_user(?, ?, ?, ?, ?, ?, ?, ?, @id, @success, @message)',
            [nom, prenom, email, hashedPassword, telephone || null, null, ville || null, role]
        )
        const [[result]] = await db.query(
            'SELECT @id as id, @success as success, @message as message'
        )
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message })
        }
        res.status(201).json({ success: true, message: result.message })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

router.put('/:id/role', verifyToken, forbidSuperAdmin, isAdmin, forbidSuperadminTarget, async (req, res) => {
    try {
        const [[target]] = await db.query('SELECT role FROM users WHERE id = ?', [req.params.id])
        if (!target) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' })
        }
        if (!['client', 'technicien'].includes(target.role)) {
            return res.status(403).json({
                success: false,
                message: 'Seuls les comptes client ou technicien peuvent être modifiés.'
            })
        }
        const { role } = req.body
        if (!['client', 'technicien'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Rôle autorisé : client ou technicien' })
        }
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id])
        res.json({ success: true, message: 'Rôle mis à jour' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

router.put('/:id/toggle', verifyToken, forbidSuperAdmin, isAdmin, forbidSuperadminTarget, async (req, res) => {
    try {
        const [[target]] = await db.query('SELECT role FROM users WHERE id = ?', [req.params.id])
        if (!target) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' })
        }
        if (!['client', 'technicien'].includes(target.role)) {
            return res.status(403).json({
                success: false,
                message: 'Seuls les comptes client ou technicien peuvent être activés ou désactivés ici.'
            })
        }
        await db.query(
            'UPDATE users SET is_active = NOT is_active WHERE id = ?',
            [req.params.id]
        )
        res.json({ success: true, message: 'Statut mis à jour' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

module.exports = router
