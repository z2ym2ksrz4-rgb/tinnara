/** PIN hash, salted with the app slug so a PIN hash from one app is useless in another. */
export declare function sha256(text: string): Promise<string>;
