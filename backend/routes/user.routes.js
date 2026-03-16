const express = require('express')
const router = express.Router()
const db = require('../config/db')
const { verifyToken, isAdmin, isSuperAdmin } = require('../middleware/auth.middleware')

router.get('/techniciens', verifyToken, isAdmin, async (req, res) => {
    try {
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


router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nom, prenom, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
        )
        res.json({ success: true, data: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})


router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { nom, prenom, email, password, telephone, ville, role } = req.body
        if (!nom || !prenom || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Champs manquants' })
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


router.put('/:id/role', verifyToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body
        if (!['client', 'technicien', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Rôle invalide' })
        }
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id])
        res.json({ success: true, message: 'Rôle mis à jour' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})


router.put('/:id/toggle', verifyToken, isAdmin, async (req, res) => {
    try {
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


router.get('/admins', verifyToken, isSuperAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nom, prenom, email, role, is_active, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
            ['admin']
        )
        res.json({ success: true, data: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})


router.post('/admins', verifyToken, isSuperAdmin, async (req, res) => {
    try {
        const { nom, prenom, email, password, telephone, ville } = req.body
        if (!nom || !prenom || !email || !password) {
            return res.status(400).json({ success: false, message: 'Champs manquants' })
        }
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.query(
            'CALL sp_register_user(?, ?, ?, ?, ?, ?, ?, ?, @id, @success, @message)',
            [nom, prenom, email, hashedPassword, telephone || null, null, ville || null, 'admin']
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


router.put('/admins/:id/toggle', verifyToken, isSuperAdmin, async (req, res) => {
    try {
        await db.query(
            'UPDATE users SET is_active = NOT is_active WHERE id = ? AND role = ?',
            [req.params.id, 'admin']
        )
        res.json({ success: true, message: 'Statut mis à jour' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})
router.delete('/admins/:id', verifyToken, isSuperAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ? AND role = ?', [req.params.id, 'admin'])
        res.json({ success: true, message: 'Admin supprimé' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

module.exports = router