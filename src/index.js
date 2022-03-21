import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express')
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
import  router from "./router/index.js";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {
	validateToken
} from "./middleware/validateToken.js";

dotenv.config();
console.log(process.env.MONGO_URI);
// Connect to Mongo instance
mongoose.connect(process.env.MONGO_URI, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
}).then(() => {
	console.log('Successfully connected to MongoDB');
}).catch((error) => {
	console.error('An error occurred when attempting to connect to MongoDB');
	console.error(error);
});

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

app.use(cors({
	origin: ['http://localhost:3000', 'http://localhost:3001'],
	//origin: ['http://localhost:3000'],
	credentials: true,
}));
app.use(validateToken)
app.use('/', router)
app.use(express.static('static'))

app.use(function (req, res) {
	const err = new Error('Not Found')
	err.status = 404
	res.json(err)
})

app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

function logErrors(err, req, res, next) {
	console.error("I am ServerError ", err.stack)
	next(err)
}

function errorHandler(err, req, res, next) {
	console.log("i am error", err);
	return res.status(500).send( {
		error: err
	})
}

function clientErrorHandler(err, req, res, next) {
	if (req.xhr) {
		return res.status(500).send({
			error: 'Something failed!'
		})
	} else {
		next(err)
	}
}

app.listen(process.env.PORT || 3001, function () {
	console.log('Example app listening on port 3001!');
});