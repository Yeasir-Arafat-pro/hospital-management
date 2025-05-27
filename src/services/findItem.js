const createError = require('http-errors')
const mongoose  = require("mongoose");


const findWithId = async (model, id, options={}) => {


    try {

        const item = await model.findById(id, options)
        
        //
        if(!item) throw createError(404, `${model.modelName} does not exist in this id`);

        return item;
        
    } catch (error) {
        if(error instanceof mongoose.Error){
           throw createError(400, 'Ivalid User ID')
        }
        throw error;
    }

  

}

module.exports = {findWithId};