import { Options, PoolOptions } from "sequelize";

interface SequelizeOptions {
  username: string;
  password: string;
  database: string;
  options: Options;
  port: string;
  dialectOptions: object;
  pool: PoolOptions;
  define: any;
}

interface ConfigsOptions {
  development: SequelizeOptions;
  test: SequelizeOptions;
  production: SequelizeOptions;
}

const configs: ConfigsOptions = {
  development: {
    username: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASS as string,
    database: process.env.DATABASE_NAME_DEV as string,
    port: process.env.DATABASE_PORT as string,
    options: {
      host: process.env.DATABASE_HOST as string,
      dialect: "mysql",
      logging: true,
      timezone: "-04:00",
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
    },
  },
  test: {
    username: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASS as string,
    database: process.env.DATABASE_NAME_TEST as string,
    port: process.env.DATABASE_PORT as string,
    options: {
      host: process.env.DATABASE_HOST as string,
      dialect: "mysql",
      logging: true,
      timezone: "-04:00",
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
    },
  },
  production: {
    username: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASS as string,
    database: process.env.DATABASE_NAME as string,
    port: process.env.DATABASE_PORT as string,
    options: {
      host: process.env.DATABASE_HOST as string,
      dialect: "mysql",
      logging: true,
      timezone: "-04:00",
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
    },
  },
};

export default configs;
