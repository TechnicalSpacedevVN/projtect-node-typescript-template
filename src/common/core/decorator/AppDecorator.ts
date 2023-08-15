import cors from "cors";
import { config } from "dotenv";
import express, { Express } from "express";
import helmet from "helmet";
import path from "path";
import { errorMiddleware } from "../../config/error.middleware";
import { IDatabaseConfig, main as connectDatabase } from "../mongoose-config";
import { BaseMiddleware } from "../BaseMiddleware";
import { container } from "./DI-IoC";
import { APP_TOKEN } from "./key";

interface AppDecoratorOptions {
  controllers?: any[];
  database?: IDatabaseConfig;
  guard?: new () => BaseMiddleware;
  modules?: any[];
}

export interface AppData {
  app: Express;
  guard?: BaseMiddleware;
}

export const AppDecorator = (options?: AppDecoratorOptions) => {
  let { controllers, modules } = options || {};

  return (target: any) => {
    return class extends target {
      app: Express;
      constructor() {
        super();
        this.app = express();

        let appData: AppData = {
          app: this.app,
        };

        if (options?.guard) {
          appData.guard = new options.guard();
        }

        container.register(APP_TOKEN, appData);

        if (options?.database) {
          connectDatabase(options.database);
        }

        config();

        this.app.set("view engine", "html");
        this.app.set("views", path.resolve("./src/views"));

        this.app.use(express.json());
        this.app.use(cors());

        this.app.use(helmet());

        if (Array.isArray(controllers) && controllers.length > 0) {
          for (let i in controllers) {
            new controllers[i]();
          }
        }
        this.app.use(errorMiddleware);
      }

      async listen(port: number | string | undefined, cb: () => void) {
        for (let i in options?.modules) {
          let m = options?.modules[i as any];
          let module = new m();
          await module.start();
        }
        this.app.listen(port, cb);
      }

      use(...args: any[]): void {
        this.app.use(...args);
      }
    };
  };
};

export class BaseApp {
  listen(port: number | string | undefined, cb: Function) {}
  use(...args: any[]): void {}
}