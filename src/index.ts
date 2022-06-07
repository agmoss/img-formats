import sharp from "sharp";

import { pipe } from "fp-ts/function";

// TODO: Make this part of the api
export const SIZE_SCHEDULE = {
    xlarge: 1.25,
    large: 1,
    medium: 0.75,
    small: 0.5,
    xsmall: 0.25,
};

const FORMATS_TO_PROCESS = ["jpeg", "png", "webp", "tiff"];

const getDimensions = async (buffer: Buffer) => {
    const { width = null, height = null } = await sharp(buffer).metadata();
    return { width, height };
};

const isSupportedImage = async (buffer: Buffer) => {
    const meta = await sharp(buffer).metadata();
    if (!meta.format) {
        throw Error("Image format not discernable");
    }
    return FORMATS_TO_PROCESS.includes(meta.format);
};

export const resize = async ({
    buffer,
    format,
    opts,
}: {
    buffer: Buffer;
    format: keyof sharp.FormatEnum;
    opts: sharp.ResizeOptions;
}): Promise<{ buffer: Buffer } & sharp.ResizeOptions> => {
    return {
        buffer: await sharp(buffer, { sequentialRead: true })
            .resize({
                ...opts,
            })
            .toFormat(format)
            .toBuffer(),
        ...opts,
    };
};

export const createFormats = async ({
    buffer,
    format,
    fit,
}: {
    buffer: Buffer;
    format: keyof sharp.FormatEnum;
    fit: keyof sharp.FitEnum;
}) => {
    const dims = await getDimensions(buffer);

    if (!dims.height || !dims.width) {
        throw new Error("File dimensions non discernable");
    }

    const _width = dims.width;
    const _height = dims.height;

    return await Promise.all(
        Object.values(SIZE_SCHEDULE).map(async (_size) => {
            return await resize({
                buffer: buffer,
                format: format,
                opts: {
                    width: Math.round(_width * _size),
                    height: Math.round(_height * _size),
                    fit: fit,
                },
            });
        })
    );
};

export const main = (f: Parameters<typeof createFormats>[0]) =>
    pipe(
        f,
        () => isSupportedImage(f.buffer),
        () => createFormats(f)
        // TODO: Create a data structure to return
    );
