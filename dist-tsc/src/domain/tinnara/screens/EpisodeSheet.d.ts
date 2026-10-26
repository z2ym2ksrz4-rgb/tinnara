/**
 * The spike sheet (a period where the tinnitus is clearly louder than usual) in four tempos:
 *  - quick   : right after "Louder now" — one question (how loud?), everything else can wait.
 *  - live    : the spike is running — end it, set how loud, or open everything.
 *  - journey : when the spike ends (or the user comes back) — 4 short steps with the user's 6 most used chips each,
 *              "more…" expands, every step can be skipped. Ends with this spike vs. your average (Pro).
 *  - full    : the complete editable form (start/end, slider, all chips, medication, note, delete).
 * All writes happen immediately; the modes only change what is on screen.
 */
export declare function EpisodeSheet(): import("react").JSX.Element | null;
