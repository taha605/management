const express = require('express')
const router = express.Router()
const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/register', async (req , res) => {
    try{
        const {nom , prenom , email , password , telephone , adresse , ville } = req.body

        if(!nom || !prenom || !email || !password){
            return res.status(400).json({
                success: false,
                message: 'Champs obligatoires manquants'
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'CALL sp_register_user(? , ? , ? , ? , ? , ? , ? , ? ,@id , @success , @message)',
            [nom , prenom , email , hashedPassword , telephone || null , adresse || null, ville || null, 'client']
        );

        const [[result]] = await db.query(
            'SELECT @id as id , @success as success, @message as message'
        );

        if(!result.success){
            return res.status(400).json({success: false , message: result.message})
        }

        const token = jwt.sign(
            {id: result.id,role: 'client'},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        )

        res.status(201).json({success: true, token, message: result.message})

    } catch (err) {
        console.error('ERREUR REGISTER:', err)  
        res.status(500).json({success:false , message: 'Erreur serveur'})
    }
})



router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            })
        }
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        )
        if(!users.length) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            })
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch)
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            })
        if (!user.is_active){
            return res.status(401).json({
                success: false,
                message: 'Compte désactivé'
            })
        }
        const token = jwt.sign(
            {id: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        )
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            }
        })
    } catch(err) {
        console.error(err);
        res.status(500).json({success: false, message: 'Erreur serveur'})
    }
})


module.exports = router


