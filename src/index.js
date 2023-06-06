const cors = require('cors');
const app = require("./app");

const corsOptions ={
   origin:'*', 
   credentials:true,           
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 

const port = process.env.PORT;
app.listen(port, () => console.log("Server Started on port ", port));
