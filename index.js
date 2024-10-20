const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process'); // For executing Python scripts

const app = express();
const PORT = 4000;  // Or any other available port


// Create the uploads folder if it doesn't exist
const uploadFolder = 'uploads';
if (!fs.existsSync(uploadFolder)){
    fs.mkdirSync(uploadFolder);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log('File uploaded successfully:', req.file);

    // Call your facial feature recognition script here
    exec(`python3 /Users/aidantyler/Desktop/NSYNC-2/recognizeFace.py ${req.file.path}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing the script: ${error.message}`);
            return res.status(500).send('Error processing the image.');
        }
        if (stderr) {
            console.error(`Script stderr: ${stderr}`);
            return res.status(500).send('Error processing the image.');
        }

        console.log(`Script output: ${stdout}`);
        res.json({ message: 'File uploaded and processed successfully', file: req.file });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
