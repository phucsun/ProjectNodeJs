const express = require("express");
require("dotenv").config();
const routeAdmin = require("./routes/admin/index.route");
const route = require("./routes/client/index.route");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require('express-flash');
const cookieParser = require("cookie-parser");
const session = require("express-session");



const database = require("./config/database");
const systemConfig = require("./config/system");
database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride("_method"));


app.use(bodyParser.urlencoded({ extended: false }))
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use(cookieParser('helloToMyWebhihi'));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log(__dirname);
app.use(express.static(`${__dirname}/public`));
route(app);
routeAdmin(app);

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});