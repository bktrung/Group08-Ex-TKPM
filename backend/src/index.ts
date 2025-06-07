import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { config } from "dotenv";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import { NotFoundError } from "./responses/error.responses";
import routes from "./routes";
import cors from "cors";
import { errorLogger } from "./middlewares/error-logger.middleware";
import i18n from "./configs/i18n.config";
import middleware from "i18next-http-middleware";

config();

const app = express();
const PORT = process.env.PORT || 3000;

// load config
import "./configs/init.config";

app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// allow cross-origin requests from any origin only for development
app.use(cors());

// Setup i18n middleware
app.use(middleware.handle(i18n));

// init db
import "./dbs/init.mongodb";

// Initialize DI container after all modules are loaded
import { configureDI } from "./configs/di.config";
configureDI();

// init routes
app.use(routes);

// handle errors
app.use((req: Request, res: Response, next: NextFunction) => {
	next(new NotFoundError("API endpoint not found"));
});

app.use(errorLogger);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;

    // Get the translation function from the request
    const t = req.t || ((key: string) => key);
    
    // Translate the error message
    const translatedMessage = t(err.message || "Internal Server Error");

    res.status(statusCode).json({
        status: "error",
        code: statusCode,
        message: translatedMessage,
        // Include stack trace only in development for debugging
        ...(process.env.NODE_ENV === "dev" && { stack: err.stack }),
    });
};

app.use(errorHandler);


// start server
app.listen(PORT, () => {
	console.log(`Server is running on Port: ${PORT}`);
});
