import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Tạo kết nối cơ sở dữ liệu
const connectionString = process.env.DATABASE_URL!;
// Tạo một client chỉ cho migration
export const migrationClient = postgres(connectionString, { max: 1 });

// Tạo một client cho Drizzle
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });