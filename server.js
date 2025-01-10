const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const bodyParser = require('body-parser');

const app = express();

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Enable CORS to allow access from other devices on the LAN
app.use(cors());

// Set up storage engine for multer to specify the upload destination and filename
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const filePath = path.join(uploadDir, file.originalname);
        if (fs.existsSync(filePath)) {
            console.log(`File ${file.originalname} already exists. Skipping.`);
            cb(new Error(`File ${file.originalname} already exists.`), file.originalname);
        } else {
            cb(null, file.originalname); // Use the original file name
        }
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filePath = path.join(uploadDir, file.originalname);
        if (fs.existsSync(filePath)) {

            file.error = new Error(`File ${file.originalname} already exists with the same name.`);
            cb(null, false); // Reject the file
        }
        else {
            cb(null, true); // Accept the file
        }
    }
});

// Serve a simple HTML form to upload files
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Upload</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        #container {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        #dropbox {
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 20px;
            cursor: pointer;
            transition: border-color 0.3s;
        }

        #dropbox:hover {
            border-color: #000;
        }

        input[type="submit"] {
            background-color: #007BFF;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        input[type="submit"]:hover {
            background-color: #0056b3;
        }

        #progress,
        #status {
            margin-top: 20px;
        }

        a {
            display: inline-block;
            margin-top: 20px;
            text-decoration: none;
            color: #007BFF;
        }

        a:hover {
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <div id="container">
        <h1>Upload Photos and Videos</h1>
        <form ref='uploadForm' id='uploadForm' action='/upload' method='post' encType="multipart/form-data">
            <input type="file" name="files" multiple />
            <br />
            <br />
            <input type='submit' value='Upload!' />
        </form>
        <div id="progress"></div>
        <div id="status"></div>
        <a href="/">Refresh</a>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('uploadForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const files = form.querySelector('input[type="file"]').files;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const data = {
                        filename: file.name,
                        size: file.size
                    };

                    fetch('/check', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.exists) {
                                // alert(\`File \${file.name} already exists.\`);
                                document.getElementById('status').innerHTML += \`<li>✖️\${file.name} already exists </li>\`;
                } else {
                  const uploadFormData = new FormData();
                  uploadFormData.append('files', file);
                  const xhr = new XMLHttpRequest();
                  xhr.open('POST', '/upload', true);
                  xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                      const percentComplete = (event.loaded / event.total) * 100;
                      document.getElementById('progress').innerText = \`Upload progress: \${percentComplete}%\`;
                    }
                  };
                  xhr.onload = () => {
                    console.log(xhr.responseText);
                    if (xhr.status === 200) {
                            document.getElementById('status').innerHTML += \`<p>\${xhr.responseText}</p>\`;
                    } else {
                            document.getElementById('status').innerText = 'File upload failed.';
                    }
                };
                xhr.onerror = () => {
                    document.getElementById('status').innerText = 'An error occurred during the file upload.';
                };
                xhr.send(uploadFormData);
                }
              })
              .catch(error => {
                console.error('Error:', error);
              });
            }
          });
          });
    </script>
</body>

</html>
        `);

});

// Check if file exists
app.post('/check', express.json(), (req, res) => {
    console.log("Checking file", req.body);
    const { filename, size } = req.body;
    if (!filename || !size) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const filePath = path.join(uploadDir, filename);
    //console.log("Checking file at path", filePath);

    const exists = fs.existsSync(filePath);
    console.log("File exists", exists)

    if (exists) {
        return res.json({ exists: true, filename: filename, size: size, comment: 'File already exists' });
    }
    console.log("File does not exist", filePath, size);
    res.json({ exists: false });
});

app.post('/upload', upload.array('files'), (req, res) => {
    const files = req.files || [];
    const results = files.map(file => ({
        filename: file.originalname,
        status: file.error ? 'failed' : 'uploaded successfully'
    }));

    res.send(`${results.map(result => `<li>✔️${result.filename}: ${result.status}</li>`).join('')}`);
});

// Start the server on a specific port (e.g., 3000)
const port = 3000;

// Listen on LAN (0.0.0.0 to allow other devices on the network to connect)
app.listen(port, '0.0.0.0', () => {
    const ifaces = os.networkInterfaces();
    let localIP;
    for (const iface in ifaces) {
        for (const details of ifaces[iface]) {
            if (details.family === 'IPv4' && !details.internal) {
                localIP = details.address;
            }
        }
    }
    console.log(`Server is running on http://${localIP}:${port}`);
});
