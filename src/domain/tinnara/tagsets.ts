import type { TagGroupDef } from "@/core/diary";

/**
 * Tinnitus tag sets. Keys are stable identifiers (seed ids are derived from them – never rename, only add);
 * labels live in locales under diary.tags.<group>.<key>.
 */
export const tinnitusTagGroups: TagGroupDef[] = [
  {
    key: "trigger",
    kind: "trigger",
    tags: [
      "loud_noise", "headphones", "concert", "quiet_room", "stress", "poor_sleep", "caffeine", "alcohol", "salt",
      "nicotine", "jaw_clench", "neck_tension", "cold_illness", "flight_pressure", "medication_change", "fatigue", "exertion",
    ],
  },
  {
    key: "sound",
    kind: "custom",
    tags: ["ringing", "whistling", "hissing", "buzzing", "humming", "roaring", "pulsing", "clicking", "several"],
  },
  {
    key: "location",
    kind: "location",
    tags: ["left", "right", "both", "in_head"],
  },
  {
    key: "symptom",
    kind: "symptom",
    tags: [
      "hyperacusis", "ear_fullness", "muffled_hearing", "dizziness", "headache", "jaw_pain", "neck_pain",
      "concentration", "sleep_trouble", "anxiety", "irritability", "fatigue",
    ],
  },
  {
    key: "relief",
    kind: "relief",
    tags: ["masking", "nature_sounds", "music", "distraction", "relaxation", "breathing", "exercise", "sleep", "hearing_aid", "fresh_air", "talking"],
  },
];
