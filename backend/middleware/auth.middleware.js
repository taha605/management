const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = (req , res , next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];

    if (!token){
        return res.status(401).json({
            success: false,
            message: 'Token manquant'
        })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err , decoded) => {
    if(err){
        return res.status(401).json({
            success: false,
            message: 'Token invalide'
        })
    }
    req.user = decoded;
    next()
})
}

const isAdmin = (req, res , next) =>{
    if(req.user.role !== 'admin'){
        return res.status(403).json({
            success: false,
            message: 'Acces refuse - Admin seulement'
        })
    }
    next()
}

const isTechnicien = (req, res, next) => {
    if(req.user.role !== 'technicien') {
        return res.status(403).json({
            success: false,
            message: 'Acces refuse - Technicien selement'
        })
    }
    next()
}

const isClient = (req, res, next) => {
    if(req.user.role !== 'client') {
        return res.status(403).json({
            success: false,
            message: 'Acces refuse - Client selement'
        })
    }
    next()
}

const isSuperAdmin = (req, res, next) => {
    if(req.user.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé — Super Admin seulement'
        })
    }
    next()
}

/** Admin (opérationnel) ou SuperAdmin (pilotage) — typiquement lecture (GET) */
const isAdminOrSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé — Administrateur requis'
        })
    }
    next()
}

/** Super admin : consultation globale uniquement, pas d’actions opérationnelles ici */
const forbidSuperAdmin = (req, res, next) => {
    if (req.user.role === 'superadmin') {
        return res.status(403).json({
            success: false,
            message:
                'Consultation seule : les modifications opérationnelles sont réservées aux administrateurs. Utilisez les écrans Super admin pour la gestion des comptes.'
        })
    }
    next()
}

module.exports = {
    verifyToken,
    isAdmin,
    isTechnicien,
    isClient,
    isSuperAdmin,
    isAdminOrSuperAdmin,
    forbidSuperAdmin
}