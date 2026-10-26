import { seedMigration } from "@/core/diary";
import { tinnaraConfig } from "./config";
// Engine owns 10–19; tinnara starts at 20.
export const tinnaraMigrations = [seedMigration(20, tinnaraConfig)];
