const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


let Schema = mongoose.Schema;

let categoriaSchema = new Schema({

    nombre:{
        type: String,
        required: [true, 'El nombre es necesario'],
        unique: true
    },
    usuario:{
        //type: String,
        type: Schema.Types.ObjectId, ref: 'Usuario',
        required: [true, 'El usuario es necesario']
    }
});

categoriaSchema.plugin(uniqueValidator,{message: '{PATH} debe ser único'});

module.exports= mongoose.model('Categoria',categoriaSchema);