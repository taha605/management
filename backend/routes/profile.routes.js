const express = require('express')
const router = express.Router()
const db = require('../config/db')
const bcrypt = require('bcryptjs')
const { verifyToken } = require('../middleware/auth.middleware')


router.get('/', verifyToken, async (req, res) => {
    try {
        const [[user]] = await db.query(
            'SELECT id, nom, prenom, email, telephone, ville, role FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ success: true, data: user });

    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})


router.put('/', verifyToken, async (req, res) => {
    try {
        const { nom, prenom, telephone, ville } = req.body
        if (!nom || !prenom) {
            return res.status(400).json({ success: false, message: 'Nom et prénom obligatoires' })
        }
        await db.query(
            'UPDATE users SET nom = ?, prenom = ?, telephone = ?, ville = ? WHERE id = ?',
            [nom, prenom, telephone || null, ville || null, req.user.id]
        );

        res.json({ success: true, message: 'Profil mis à jour' });
    
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})


router.put('/password', verifyToken, async (req, res) => {
    try {
        const { ancien_password, nouveau_password } = req.body
        if (!ancien_password || !nouveau_password) {
            return res.status(400).json({ success: false, message: 'Champs manquants' })
        }
        
        const [[user]] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id])
        const isMatch = await bcrypt.compare(ancien_password, user.password)
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Ancien mot de passe incorrect' })
        }
        const hashed = await bcrypt.hash(nouveau_password, 10)
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id])
        res.json({ success: true, message: 'Mot de passe changé avec succès' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})

module.exports = router