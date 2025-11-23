import ffmpeg from "fluent-ffmpeg";
import { Readable, PassThrough } from "stream";

export interface TranscodeResult {
  buffer: Buffer;
  filename: string;
}

/**
 * Transcodes an audio file to MP4/AAC format for universal browser compatibility
 *
 * Converts any audio format (WebM, OGG, MP3, etc.) to MP4 with AAC codec
 * which is supported by all major browsers including Safari, Chrome, Firefox, Edge
 *
 * @param inputBuffer - The input audio file as a Buffer
 * @param originalFilename - Original filename (used to generate output filename)
 * @returns Promise with transcoded buffer and new filename
 */
export async function transcodeToMP4AAC(
  inputBuffer: Buffer,
  originalFilename: string
): Promise<TranscodeResult> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const inputStream = Readable.from(inputBuffer);
    const outputStream = new PassThrough();

    // Generate output filename with .m4a extension (MP4 audio)
    const outputFilename = originalFilename.replace(/\.[^.]+$/, ".m4a");

    // Collect output data
    outputStream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    outputStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve({ buffer, filename: outputFilename });
    });

    ffmpeg(inputStream)
      // Set audio codec to AAC
      .audioCodec("aac")
      // Set audio bitrate (128k is good quality for voice/music)
      .audioBitrate("128k")
      // Set audio channels to stereo (2)
      .audioChannels(2)
      // Set audio frequency (44.1kHz is standard)
      .audioFrequency(44100)
      // Output format as MP4 (which will contain AAC audio)
      .format("mp4")
      // Add movflags for better web compatibility
      // - frag_keyframe: allows streaming before complete download
      // - empty_moov: move metadata to beginning for faster playback
      // - faststart: optimize for web streaming
      .outputOptions(["-movflags", "frag_keyframe+empty_moov+faststart"])
      .on("error", (err) => {
        reject(new Error(`FFmpeg transcoding failed: ${err.message}`));
      })
      // Pipe output to our PassThrough stream
      .pipe(outputStream, { end: true });
  });
}

/**
 * Checks if a file is an audio file based on MIME type
 */
export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith("audio/");
}
