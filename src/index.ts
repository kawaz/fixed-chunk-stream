/**
 * Transforms a stream of bytes into fixed-size chunks.
 * By default, any remaining bytes that cannot form a complete chunk at the end of the stream are emitted.
 * Set discardIncompleteChunks: true to discard incomplete chunks at the end of the stream.
 *
 * @example
 * ```ts
 * // Transform stream into 1KB chunks, including incomplete chunks
 * stream.pipeThrough(new FixedChunkStream(1024))
 *
 * // Only emit complete chunks, discarding incomplete data
 * stream.pipeThrough(new FixedChunkStream(1024, { discardIncompleteChunks: true }))
 * ```
 */
export class FixedChunkStream extends TransformStream<Uint8Array, Uint8Array> {
    constructor(
      /** @param size The size of each chunk in bytes */
      size: number,
      /** @param options Configuration options */
      options: FixedChunkStreamOptions = {},
    ) {
      const { discardIncompleteChunks = false } = options;
      const buffer = new Uint8Array(size);
      let bufferUsed = 0;
      super({
        transform(chunk, controller) {
          let chunkOffset = 0;
          while (chunkOffset < chunk.length) {
            const bytesAvailable = buffer.length - bufferUsed;
            const bytesToCopy = Math.min(
              bytesAvailable,
              chunk.length - chunkOffset,
            );
            buffer.set(
              chunk.slice(chunkOffset, chunkOffset + bytesToCopy),
              bufferUsed,
            );
            bufferUsed += bytesToCopy;
            chunkOffset += bytesToCopy;
            if (bufferUsed === buffer.length) {
              controller.enqueue(buffer);
              bufferUsed = 0;
            }
          }
        },
        flush(controller) {
          if (0 < bufferUsed && !discardIncompleteChunks) {
            controller.enqueue(buffer.slice(0, bufferUsed));
          }
        },
      });
    }
  }

  interface FixedChunkStreamOptions {
    /**
     * If true, discards chunks smaller than the specified size at the end of the stream.
     * If false (default), allows emitting a chunk smaller than the specified size at the end of the stream.
     * @default false
     */
    discardIncompleteChunks?: boolean;
  }
