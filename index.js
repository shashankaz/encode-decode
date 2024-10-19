import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swagger from "swagger-ui-express";
import "dotenv/config";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Base64 Encoder/Decoder API",
  });
});

const auth = (req, res, next) => {
  const { x_api_key } = req.headers;

  if (x_api_key === process.env.x_api_key) {
    next();
  } else if (x_api_key !== process.env.x_api_key) {
    res.status(401).json({
      message: "Please provide a valid API key",
    });
  } else {
    res.status(401).json({
      message: "Please provide an API key",
    });
  }
};

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x_api_key
 *   schemas:
 *     EncodeRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         input:
 *           type: string
 *           description: The plain text to encode
 *     DecodeRequest:
 *       type: object
 *       required:
 *         - encodedText
 *       properties:
 *         input:
 *           type: string
 *           description: The Base64 encoded text
 */

/**
 * @swagger
 * /encode:
 *   post:
 *     summary: Base64 encode a plain text
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncodeRequest'
 *     responses:
 *       200:
 *         description: Encoded text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 */

app.post("/encode", auth, (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({
      message: "Please provide an input",
    });
  }

  // const encoded = btoa(input);
  const encoded = Buffer.from(input).toString("base64");

  res.status(200).json({
    output: encoded,
  });
});

/**
 * @swagger
 * /decode:
 *   post:
 *     summary: Base64 decode an encoded text
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DecodeRequest'
 *     responses:
 *       200:
 *         description: Decoded text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 */

app.post("/decode", auth, (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({
      message: "Please provide an input",
    });
  }

  // const decoded = atob(input);
  const decoded = Buffer.from(input, "base64").toString("utf-8");

  res.status(200).json({
    output: decoded,
  });
});

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Base64 Encoder/Decoder API",
      version: "1.0.0",
      description: "A simple API to encode and decode Base64 strings",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./index.js"],
};

const specs = swaggerJSDoc(options);
app.use("/docs", swagger.serve, swagger.setup(specs));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
