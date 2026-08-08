const fs = require('fs')
const path = require('path');

// var dateFormat = require('dateformat')
var logs = {
    ErrorHandler: async function (ex, response) {
        let date = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).split(" ")[0].split('/');
        var FileName = parseInt(date[2]) + '-' + parseInt(date[0]) + '-' + parseInt(date[1]) + '.json';
        // var error = ex.split(':');
        const logDir = path.join(__dirname, '../../logs');

        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        // var file = 'logs/' + FileName;
        const file = path.join(logDir, FileName);
        const errorObj = {
            error: ex.name,
            message: ex.message,
            stack: ex.stack,
            date: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false })
        }
        if (fs.existsSync(file)) {
            fs.readFile(file, 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.error("Failed to read log file:", err);
                } else {
                    let obj = [];

                    try {
                        obj = JSON.parse(data);
                    } catch (e) {
                        obj = [];
                    }

                    obj.push(errorObj);
                    const json = JSON.stringify(obj, null, 2);
                    fs.writeFile(file, json, 'utf8', function (err) {
                        if (err) {
                            console.error("Failed to write log:", err);
                        }

                        return response.status(500).json({
                            status: false,
                            message: "Internal server error.",
                            data: []
                        });
                    });
                }
            });
        } else {
            const obj = [];
            obj.push(errorObj);
            const json = JSON.stringify(obj, null, 2);
            fs.writeFile(file, json, 'utf8', function (err) {
                if (err) {
                    console.error("Failed to write log:", err);
                }

                return response.status(500).json({
                    status: false,
                    message: "Internal server error.",
                    data: []
                });
            });
        }

    },
    fileList: async function (request, response) {
        try {
            let date = request.body.date
            date = new Date(date).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).split(" ")[0].split('/');
            date = parseInt(date[2]) + '-' + parseInt(date[0]) + '-' + parseInt(date[1]) + '.json';
            const logDir = path.join(__dirname, '../../logs');
            const file = path.join(logDir, date);
            if (fs.existsSync(file)) {
                let rawdata = fs.readFileSync(file, 'utf-8');
                let jsonObject = JSON.parse(rawdata);
                response.status(200).json({ status: true, message: "this date log exists", data: jsonObject });
            } else {
                response.status(404).json({ status: false, message: "this date log not exists", data: [] });
            }
        } catch (ex) {
            logs.ErrorHandler(ex, response)
        }

    }
}
module.exports = logs;