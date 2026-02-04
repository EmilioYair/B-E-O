const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

router.get('/', async(req, res) => {
    res.render('pages/inicio', {
        pageTtile: 'BE - Servicios'
    })
})


router.get('/encuentra', async (req, res) => {
    res.render('./Views/Pages/encuentra', {
        pageTittle: BEO - Encuentra
    })
})