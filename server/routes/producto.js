
const express = require('express');

const {verificaToken} = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');



// ==========================
// Obtener productos
// ==========================
app.get('/productos', verificaToken , (req, res)=> {
    let desde = req.query.desde || 0;
    desde=Number(desde);
    let limite = req.query.limite || 5;
    limite= Number(limite);

    Producto.find({disponible: true})
          .skip(desde)
          .limit(limite)
          .populate('usuario', 'nombre email')
          .populate('categoria', 'nombre')
          .exec((err, productos) => {
            if (err) {
              return res.status(400).json({
                  ok: false,
                  err
              });
            }

            Producto.count({disponible: true}, (err,conteo) =>{

              res.json({
                ok: true,
                productos,
                cuantos: conteo
              });

            });
          });
});


// ==========================
// Obtener un producto por id
// ==========================
app.get('/productos/:id', verificaToken , (req, res)=> {
    let id = req.params.id

    Producto.findById(id, (err,productoDB)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
          }

          if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'No se encontro el producto'
                }
            });
          }
          
          res.json({
            ok: true,
            producto:productoDB
          });
    });



});


// ==========================
// Buscar productos
// ==========================

app.get('/productos/buscar/:termino',verificaToken,(req,res)=>{
    
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
        .populate('categoria', 'nombre')
        .exec((err, productos)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
              }
            res.json({
                ok: true,
                productos
            })

        });
});



// ==========================
// Crear un nuevo producto
// ==========================
app.post('/productos/', verificaToken , (req, res)=> {
    let body = req.body;
    let producto= new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });
    
    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });


});


// ==========================
// Actualizar un producto por id
// ==========================
app.put('/productos/:id', verificaToken ,(req, res)=> {
    let id =req.params.id;
    let body = req.body;
    let producto= {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    };



    Producto.findByIdAndUpdate (id , producto , {new: true, runValidators: true, context:'query' }, (err , productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
  
        res.json({
            ok: true,
            producto: productoDB
          });
      });



});


// ==========================
// Borrar un producto por id
// ==========================
app.delete('/productos/:id', verificaToken ,(req, res)=> {
    let id = req.params.id;

      let cambiaEstado = {
        disponible: false
      };

      Producto.findByIdAndUpdate(id, cambiaEstado, {new: true} , (err, productoBorrado) => {
        if (err) {
          return res.status(400).json({
              ok: false,
              err
          });
        }

        if (!productoBorrado) {
          return res.status(400).json({
            ok: false,
            err: {
              mensaje: 'producto no encontrado'
            }
        });
        }

        res.json({
          ok: true,
          producto:productoBorrado
        });


      });


});



module.exports = app;
