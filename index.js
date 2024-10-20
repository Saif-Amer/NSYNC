const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); // Import fs module to work with the file system

const app = express();
const PORT = 3001;

// Create the uploads folder if it doesn't exist
const uploadFolder = 'uploads';
if (!fs.existsSync(uploadFolder)){
    fs.mkdirSync(uploadFolder);
}

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder); // Use the uploadFolder variable here
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use original file name
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
    res.json({ message: 'File uploaded successfully', file: req.file });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
