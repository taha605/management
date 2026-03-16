const express = require("express");
const cors = require('cors');
const db = require('./config/db')
require('dotenv').config();

const app = express();


app.use(cors({origin: process.env.FRONTEND_URL}))
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'))

app.use('/api/reclamations', require('./routes/reclamation.routes'))
app.use('/api/users', require('./routes/user.routes'))
app.get('/api/health' , (req , res) => {
    res.json({message: 'server is running'})
})

const PORT =process.env.PORT || 5000;

app.listen(PORT,() => {
    console.log(`server is running on http://localhost:${PORT}`)
})

