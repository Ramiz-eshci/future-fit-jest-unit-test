// const jwt = require('jsonwebtoken');

// module.exports = (request, response, next) => {
//     try {
//         const token = request.headers.authorization.split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_KEY);
//         request.userData = decoded;
//         next();
//     } catch {
//         response.status(401).json({ status: false,error:'unauthorized', message: 'Authorization failed', data: [] });
//     }
// }

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const ENC_KEY = crypto.createHash('sha256').update(String(process.env.ENC_KEY)).digest(); // 32 bytes key

module.exports = (request, response, next) => {
    try {
        const token = request.headers.authorization.split(" ")[1];
        //  let token;
        // if (request.headers.authorization) {
        //     token = request.headers.authorization.split(" ")[1];
        // }

        // // 🔹 2️⃣ Try cookie (video streaming)
        // else if (request.cookies?.token) {
        //     token = request.cookies.token;
        // }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        // console.log(decoded, 'dddd')
        const originalPayload = decryptPayload(decoded);
        // console.log(originalPayload, 'decrypted data')
        request.userData = originalPayload;
        next();
    } catch {
        response.status(401).json({ status: false,error:'unauthorized', message: 'Authorization failed', data: [] });
    }
}


function decryptPayload(encrypted) {
    const iv = Buffer.from(encrypted.iv, 'base64');
    const encryptedText = encrypted.data;
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}
