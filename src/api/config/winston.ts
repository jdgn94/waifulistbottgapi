import path from "path";
import { createLogger, format, LoggerOptions, transports } from "winston";
import moment from "moment";

const logFormat = format.printf((log) => {
  const date = moment().format("YYYY/MM/DD HH:mm:ss Z");
  return `${date} | ${log.level} | ${
    typeof log.message === "object" ? format.json(log.message) : log.message
  }`;
});

const options: LoggerOptions = {
  level: "debug",
  format: format.combine(format.colorize(), logFormat),
  defaultMeta: { service: "user-service" },
  handleExceptions: true,
  silent: false,
  transports: [
    new transports.File({
      level: "debug",
      filename: path.join(__dirname, "../../logs/combined.log"),
      maxsize: 5120000,
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      maxsize: 5120000,
      maxFiles: 5,
    }),
  ],
};

const logger = createLogger({ exitOnError: false });

logger.add(new transports.Console(options));

const stream = {
  write: function (message: string | JSON) {
    logger.http(message);
  },
};

export { stream, logger };
