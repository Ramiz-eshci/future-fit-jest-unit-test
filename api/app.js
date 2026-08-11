const express = require('express')
const app = express()
const session = require('express-session')
const fileUpload = require('express-fileupload')
const path = require('path')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
// const database = require('./config/database')
const checkAuth = require('./config/auth')
const randomstring = require("randomstring");
const multer = require('multer');
const upload = multer({ dest: './uploads/' });
const compression = require('compression')
const http = require('http').Server(app);
let io = require("socket.io")(http);
var requestIp = require('request-ip');
require('dotenv').config();

const fs = require('fs');
const cookieParser = require('cookie-parser');

const host = process.env.HOST

app.set('port', process.env.PORT)
app.use(compression())
app.use(cookieParser());
const helmet = require('helmet');

//  global.baseURL = 'http://' + host + ':' + app.get('port') + '/'
if (host == 'localhost') {
    global.baseURL = `http://${host}:${app.get('port')}/`;
}
else {
    global.baseURL = `https://futurefitnew.eshci.com/`;
}

global.basePath = __dirname
global.userProfileDir = 'profile_pic/'
global.uploadPath = 'uploads/'
global.uploadURL = baseURL + 'uploads/'
global.uploadPath = basePath + '/uploads/'
global.uploadDir = 'uploads/'
global.videoDir = 'videos/'
global.videoThumbDir = 'videos/thumbnails/'

// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });

if (process.env.NODE_ENV === 'development') {
    app.use(cors(({
        origin: ['http://localhost:4200', 'http://localhost:3600'],
    })))

    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: false

    }));

    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:", "http://" + host + ':' + app.get('port')],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "http://" + host + ':' + app.get('port')],
            formAction: ["'self'"],
            frameAncestors: ["'self'"]
        }
    }));
    // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
} else {
    app.use(cors(({
        origin: host,
    })))

    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: false
    }));

    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            styleSrc: ["'self'"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"]
        }
    }));
}
app.listen(app.get('port'), host, (error) => {
    console.log('Listening on http://' + host + ':' + app.get('port'))
})
app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.static(path.join(__dirname, 'uploads')))
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/uploads',
    express.static(path.join(__dirname, 'uploads'), {

        index: false,

        dotfiles: 'deny',

        extensions: false,

        redirect: false
    }));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(fileUpload({
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB
    },
    abortOnLimit: true
}));
app.use(requestIp.mw())
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true
}))
if (process.platform === "win32") {
    require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    }).on("SIGINT", function () {
        process.emit("SIGINT")
    })
}
process.on("SIGINT", function () {
    process.exit()
})
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/company', require('./routes/company.routes'));
app.use('/api/employee', require('./routes/employee.routes'));

app.use('/api/site', require('./routes/siteinformation.routes'));
app.use('/api/list', require('./routes/list.routes'));
app.use('/api/product', require('./routes/product.routes'));
app.use('/api/relevance', require('./routes/relevance.routes'))

app.use('/api/financial-assets', require('./routes/financial_asset.routes'));
app.use('/api/purchase', require('./routes/purchase_information.routes'));
app.use('/api/be04-category', require('./routes/be04_category.routes'));

app.use('/api/break-even-goals', require('./routes/break-even-goals.routes'));
app.use('/api/be-form', require('./routes/be-form.routes'));

app.use('/api/be-listing', require('./routes/be-listing.routes'))
app.use('/api/users', require('./routes/users.routes'))
app.use('/api/reports', require('./routes/reports.routes'))
app.use('/api/reference-year', require('./routes/reference-year.routes'))
app.use('/api/tutorial-videos', require('./routes/tutorial_videos.routes'))
app.use('/api/role', require('./routes/role.routes'))


// app.use('/api/category', require('./routes/category.routes'))
// app.get('/uploads/*', (request, response) => response.sendFile(path.join(__dirname, 'uploads/')))
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/assets', express.static(path.join(__dirname, 'templates/assets')));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running'
    });
});
app.get('/*', (request, response) => response.sendFile(path.join(__dirname, 'public/index.html')))