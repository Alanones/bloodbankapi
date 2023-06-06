const cors = require('cors');
const app = require("./app");

app.use(cors({
    origin: '*'
}));

const port = process.env.PORT;
app.listen(port, () => console.log("Server Started on port ", port));
