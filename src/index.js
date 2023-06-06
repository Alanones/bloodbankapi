const app = require("./app");
const port = process.env.PORT;
app.listen(port, () => console.log("Server Started on port ", port));
