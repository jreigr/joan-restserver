

const express = require('express');
const Categoria = require('../models/categoria');

let { verificaToken, verificaAdmin_role } = require('../middlewares/autenticacion');

let app = express();

let categoria = require('../models/categoria');
let usuario = require('../models/usuario');

// ==============================
// Mostrar todas las categorias
// ==============================
app.get('/categoria', verificaToken, (req,res)=>{

    Categoria.find({})
        .sort('nombre')
        .populate('usuario', 'nombre email estado')
        .exec((err, categorias) =>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
              }
            Categoria.count((err,conteo) =>{

                res.json({
                  ok: true,
                  categorias,
                  cuantos: conteo
                });
  
              });
        });    
});

// ==============================
// Mostrar una categoria por id
// ==============================
app.get('/categoria/:id',verificaToken ,(req,res)=>{
    let id = req.params.id

    Categoria.findById(id, (err,categoriaDB)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
          }

          if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'No se encontro la categoria'
                }
            });
          }
          
          res.json({
            ok: true,
            categoria:categoriaDB
          });
    });

});

// ==============================
// Crear nueva categoria
// ==============================
app.post('/categoria', verificaToken , (req,res)=>{
    let body = req.body;
    let categoria= new Categoria({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    
    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ==============================
// Actualizar una categoria por id
// ==============================
app.put('/categoria/:id', verificaToken ,function (req,res){
    let id = req.params.id;
    let body = req.body;
    let nombreCategoria = {
        nombre: body.nombre
    }
    
    Categoria.findByIdAndUpdate (id , nombreCategoria , {new: true, runValidators: true, context:'query' }, (err , categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
  
        res.json({
            ok: true,
            categoria: categoriaDB
          });
      });
    
     
    });


// ==============================
// Borrar una categoria por id
// ==============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_role] ,(req,res)=>{
    let id =req.params.id;

    Categoria.findByIdAndRemove(id,(err,categoriaDB) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err:{
                    message:'El id no existe'
                }
            });
        }
        
        res.json({
            ok: true,
            message: 'Categoria borrada'
        });


    });

});



module.exports= app;