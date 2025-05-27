const app = require('./app');
const connectDB = require('./config/db');
const {serverPort} = require('./secret');





app.listen(serverPort, async ()=>{
    console.log(`PORT is http://localhost:${serverPort}`);
    await connectDB();

})