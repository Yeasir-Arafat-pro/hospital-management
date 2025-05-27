var jwt = require('jsonwebtoken');

const createJSONwebToken = (payload,secretKey, expiresIn)=>{
    if (typeof payload !== 'object' || !payload) {
        throw new Error("payload must be a non-empty object");
        
    }

    if (typeof secretKey !== 'string' || secretKey == '') {
        throw new Error("secretKey must be a non-empty string");
        
    }

    try {
        var token = jwt.sign(payload, secretKey, {expiresIn});
        return token;
      
    } catch (error) {
        console.error('failed to sign JWT token', error);
        throw error
    }


}


module.exports = {createJSONwebToken};
