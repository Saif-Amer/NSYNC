const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { execFile } = require('child_process');

const app = express();
const PORT = 4000;  // Port to run your server

// Create the uploads folder if it doesn't exist
const uploadFolder = 'uploads';
if (!fs.existsSync(uploadFolder)){
    fs.mkdirSync(uploadFolder);
}

// Serve static files in the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files for the client-side JavaScript and HTML
app.use(express.static(path.join(__dirname))); 

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

// Serve the first HTML file (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Path to your index.html
});

// Serve the second HTML file (secondPage.html)
app.get('/secondPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'secondPage.html'));  // Path to your secondPage.html
});

// Endpoint to handle image uploads
app.post('/uploads', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log('File uploaded successfully:', req.file);

    // Path to your Python script
    const scriptPath = path.join(__dirname, 'recognizeFace.py');  
    const imagePath = path.resolve(req.file.path);  // Full path to the uploaded file

    // Execute the Python script
    execFile('python3', [scriptPath, imagePath], (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing the script: ${error.message}`);
            return res.status(500).send('Error processing the image.');
        }
        if (stderr) {
            console.error(`Script stderr: ${stderr}`);
            return res.status(500).send('Error processing the image.');
        }

        console.log(`Script output: ${stdout}`);
        res.json({ 
            message: 'File uploaded and processed successfully', 
            file: req.file, 
            extractedMouthUrl: `/uploads/extracted_mouth.jpg`  // Example response
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
