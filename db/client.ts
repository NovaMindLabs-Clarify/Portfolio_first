import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// В Docker-сборке (Render и т.п.) переменные окружения доступны только в
// рантайме контейнера, а не на этапе `docker build` — бросать здесь исключение
// уронит саму сборку. postgres() не подключается eagerly, реальное соединение
// произойдёт при первом запросе, когда DATABASE_URL уже точно будет на месте.
const queryClient = postgres(process.env.DATABASE_URL ?? "postgres://placeholder");

export const db = drizzle(queryClient, { schema });
