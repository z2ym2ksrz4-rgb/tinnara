/**
 * Domain registry. Tinnara = the generic symptom-diary engine (src/core/diary) configured for tinnitus
 * (src/domain/tinnara). A sibling app (IBS, menopause) swaps only this folder.
 */
import { diaryMigrations, configureDiary } from "@/core/diary";
import { tinnaraMigrations } from "./tinnara/migrations";
import { tinnaraConfig } from "./tinnara/config";
import { TinnaraRoutes, domainTabs, type DomainTab } from "./tinnara/routes";

configureDiary(tinnaraConfig);

export const domainMigrations = [...diaryMigrations, ...tinnaraMigrations];
export const DomainRoutes = TinnaraRoutes;
export { domainTabs };
export type { DomainTab };
