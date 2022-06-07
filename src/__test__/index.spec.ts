import { main } from "..";

import axios from "axios";

export const getBufferFromImgUrl = async (url: string) => {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "utf-8");
    return buffer;
};

describe("img-formats", () => {
    it("should create multiple sizes", async () => {
        const buffer = await getBufferFromImgUrl(
            "https://m0ss.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fandrew-moss.68ff8ef7.jpeg&w=3840&q=75"
        );

        const f = await main({ buffer, format: "jpeg", fit: "cover" });

        if (!f[0]) {
            throw Error("createFormats failed");
        }

        expect(f[0].buffer).toBeDefined();
    });
});
