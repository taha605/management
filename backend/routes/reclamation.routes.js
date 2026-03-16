const express = require('express')
const router = express.Router()
const db = require('../config/db')
const {verifyToken, isAdmin , isClient , isTechnicien} = require('../middleware/auth.middleware')

router.post('/' ,verifyToken , isClient , async(req,res) =>{
    try{
        const { marque, modele, categorie_id, description_panne, adresse_intervention, ville_intervention, priorite } = req.body

        if(!marque || !description_panne || !adresse_intervention || !ville_intervention){
            return res.status(400).json({
                success: false,
                message: 'Champs obligatiores manquants'
            })
        }

        await db.query(
            'CALL sp_create_reclamation(? , ?, ?, ? , ? , ?, ? , ? , @ref ,@id ,@success, @message)',
            [req.user.id, marque , modele || null, categorie_id ||null, description_panne ,adresse_intervention,ville_intervention,priorite ||'normale']

        )
        const [[result]] = await db.query(
            'SELECT @ref as reference, @id as id, @success as success, @message as message' 
        )
        if(!result.success){
            return res.status(400).json({
                success: false, 
                message:result.message
            })
        }
        res.status(201).json({
            success:true,
            message: result.message,
            data: {id: result.id , reference: result.reference}
        })
    }catch(err){
        console.error('ERREUR CREATE RECLAMATION:',err )
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        })
    }
})

router.get('/my', verifyToken , isClient, async (req,res) =>{
    try{
        const [rows] = await db.query(
            'SELECT * FROM v_reclamations_detail WHERE client_id = ? ORDER BY date_reclamation DESC',[req.user.id]
        )
        res.json({success: true, data: rows})
    }catch(err){
        console.error(err)
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        })
    }
})

router.get('/', verifyToken, isAdmin, async(req, res) => {
    try{
        const { statut, ville, priorite, technicien_id, date_debut, date_fin } = req.query
        let query = 'SELECT * FROM v_reclamations_detail WHERE 1=1'
        const params = []

        if(statut) { query += ' AND statut = ?'; params.push(statut) }
        if(ville) { query += ' AND ville_intervention LIKE ?'; params.push(`%${ville}%`) }
        if(priorite) { query += ' AND priorite = ?'; params.push(priorite) }
        if(technicien_id) { query += ' AND technicien_id = ?'; params.push(technicien_id) }
        if(date_debut) { query += ' AND DATE(date_reclamation) >= ?'; params.push(date_debut) }
        if(date_fin) { query += ' AND DATE(date_reclamation) <= ?'; params.push(date_fin) }

        query += ' ORDER BY date_reclamation DESC'

        const [rows] = await db.query(query, params)
        res.json({success: true, data: rows })
    }catch(err){
        console.error(err)
        res.status(500).json({success: false, message: 'Erreur serveur'})
    }
})


router.put('/:id/assign' , verifyToken, isAdmin, async(req, res) => {
    try{
        const{technicien_id} = req.body

        if(!technicien_id){
            return res.status(400).json({
                success: false,
                message: 'technicien_id manquant'
            })
        }
        await db.query(
            'CALL sp_assign_technicien(?, ?, ?, @success, @message)',
            [req.params.id, technicien_id, req.user.id]
        )

        const [[result]] = await db.query(
            'SELECT @success as success, @message as message'
        )

        if(!result.success){
            return res.status(400).json({
                success: false,
                message: result.message
            }) 
        }
        
        res.json({success: true, message: result.message})
    }catch(err){
        console.error('ERREUR ASSIGN:', err)
        res.status(500).json({success: false, message: 'Erreur serveur'})
    }
})

router.put('/:id/statut', verifyToken, async(req , res) => {
    try{
        const{statut, commentaire} = req.body

        if(!statut){
            return res.status(400).json({
                success: false,
                message: 'Statut manquant'
            })
        }

        await db.query(
    'CALL sp_update_statut(?, ?, ?, ?, @success, @message)',
    [req.params.id, statut, req.user.id, commentaire || null]
)
const [[result]] = await db.query(
    'SELECT @success as success, @message as message'
)

        if(!result.success){
            return res.status(400).json({ success: false, message: result.message})
        }

        res.json({success: true, message: result.message})
    }catch(err){
        console.error('ERREUR STATUT:', err)
        res.status(500).json({success: false, message: 'Erreur serveur' })
    }
})

router.get('/stats' , verifyToken, isAdmin, async(req, res) => {
    try{
        const [[stats]] = await db.query('SELECT * FROM v_stats_admin')
        res.json({success: true, data:stats})
    }catch(err){
        console.error(err)
        res.status(500).json({success: false, message: 'Erreur serveur'})
    }
})

router.get('/tech', verifyToken, isTechnicien, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM v_reclamations_detail WHERE technicien_id = ? ORDER BY date_reclamation DESC',
            [req.user.id]
        )
        res.json({ success: true, data: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})
router.get('/:id/historique', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT h.*, u.nom, u.prenom, u.role 
             FROM historique_statuts h
             LEFT JOIN users u ON h.changed_by = u.id
             WHERE h.reclamation_id = ?
             ORDER BY h.created_at DESC`,
            [req.params.id]
        )
        res.json({ success: true, data: rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Erreur serveur' })
    }
})
module.exports = router