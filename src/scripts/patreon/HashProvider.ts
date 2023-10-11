interface HashProvider {

    hash(data: string): Promise<string>;

}

export { HashProvider }

class DefaultHashProvider implements HashProvider {

    async hash(data: string): Promise<string> {
        // encode as (utf-8) Uint8Array
        const msgUint8 = new TextEncoder().encode(data);
        // hash the message
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        // convert buffer to byte array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
         // convert bytes to hex string
        return hashArray.map((b) => b.toString(16)
            .padStart(2, "0"))
            .join("");
    }

}

export { DefaultHashProvider }