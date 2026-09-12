import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const charactersPath = path.join(__dirname, "../characters");
const frontendPath = path.join(__dirname, "../dist");


// --------------------------------------------------
// Setup
// --------------------------------------------------

app.use(express.json());

// Serve character images
app.use(
    "/characters",
    express.static(charactersPath)
);


// --------------------------------------------------
// Image upload
// --------------------------------------------------

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, charactersPath);
    },

    filename: (req, file, cb) => {

        const characterName = req.params.name;

        // Preserve the extension from the uploaded file
        const extension = path.extname(file.originalname);

        cb(
            null,
            `${characterName}${extension}`
        );
    }

});

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid image type"));
        }

    }
});


// --------------------------------------------------
// Get character
// --------------------------------------------------

app.get("/api/characters/:name", async (req, res) => {

    try {

        const filePath = path.join(
            charactersPath,
            `${req.params.name}.json`
        );

        const data = await fs.readFile(
            filePath,
            "utf-8"
        );

        res.json(JSON.parse(data));

    } catch {

        res.status(404).json({
            error: "Character not found"
        });

    }

});


// --------------------------------------------------
// Save character
// --------------------------------------------------

app.put("/api/characters/:name", async (req, res) => {

    try {

        if (
            !req.body ||
            typeof req.body !== "object"
        ) {
            return res.status(400).json({
                error: "Invalid character data"
            });
        }

        const filePath = path.join(
            charactersPath,
            `${req.params.name}.json`
        );

        await fs.writeFile(
            filePath,
            JSON.stringify(req.body, null, 4)
        );

        res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to save character"
        });

    }

});


// --------------------------------------------------
// Upload character image
// --------------------------------------------------

app.post(
    "/api/characters/:name/image",
    upload.single("image"),
    async (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    error: "No image uploaded"
                });
            }

            res.json({
                success: true,
                filename: req.file.filename
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Failed to upload image"
            });

        }

    }
);


// --------------------------------------------------
// Serve Vue
// --------------------------------------------------

app.use(
    express.static(frontendPath)
);


// Vue Router fallback
app.get("/{*splat}", (req, res) => {

    res.sendFile(
        path.join(frontendPath, "index.html")
    );

});


// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
