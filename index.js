const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const apiRoutes = require("./routes/api");
const generalRoutes = require("./routes/route");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded());

// view engine
app.set('view engine', 'ejs');

app.use("/", generalRoutes);
app.use("/api", apiRoutes);

// database connection
mongoose.set('strictPopulate', false);
mongoose.set('strictQuery', true);
const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_CONNECTION_URI || MONGODB_CONNECTION_URI;
mongoose
	.connect(dbURI)
	.then((result) => app.listen(port, () => console.log(`Listening on port ${port}`)))
	.catch((err) => console.log(err));


