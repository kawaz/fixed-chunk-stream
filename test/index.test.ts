import { expect, test, describe } from "bun:test";
import { FixedChunkStream } from "../src/index";

describe("FixedChunkStream", () => {

  const createChunkes = (
		length: number,
		chunkSize: number,
	): Uint8Array[] => {
		const arr = Array.from({ length: length }, (_, i) => i);
		const result: Uint8Array[] = [];
		while (arr.length > 0) {
			result.push(new Uint8Array(arr.splice(0, chunkSize)));
		}
		return result;
	};

  const createReadableStream = (chunks: Uint8Array[]) => {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk.slice());
        }
        controller.close();
      },
    });
  };

  const createChunkCollector = (): [Uint8Array[], WritableStream<Uint8Array>] => {
    const chunks: Uint8Array[] = [];
    const writable = new WritableStream<Uint8Array>({
      write(chunk) {
        chunks.push(chunk.slice());
      },
    });
    return [chunks, writable];
  };

	test("should transform into fixed-size chunks", async () => {
		const totalSize = 8;
    for (const outputChunkSize of [1, 2, 3, 4, 8, 10]) {
			for (const inputChunkSize of [1, 2, 3, 4, 8]) {
				const input = createChunkes(totalSize, inputChunkSize);
				const output = createChunkes(totalSize, outputChunkSize);
				const transformer = new FixedChunkStream(outputChunkSize);
        const [chunks, collector] = createChunkCollector();
        await createReadableStream(input).pipeThrough(transformer).pipeTo(collector);
        expect(chunks).toHaveLength(output.length);
        expect(chunks).toEqual(output);
			}
		}
	});

	describe("with {discardIncompleteChunks: true}", () => {
		test("should transform correctly when there is no remainder", async () => {
      const totalSize = 8;
      for (const outputChunkSize of [1, 2, 4, 8]) {
				for (const inputChunkSize of [8]) {
          const input = createChunkes(totalSize, inputChunkSize);
          const output = createChunkes(totalSize, outputChunkSize);
          const transformer = new FixedChunkStream(outputChunkSize);
          const [chunks, collector] = createChunkCollector();
          await createReadableStream(input).pipeThrough(transformer).pipeTo(collector);
          expect(chunks).toHaveLength(output.length);
          expect(chunks).toEqual(output);
        }
      }
    })
  })

  describe("with {discardIncompleteChunks: true}", () => {
		test("should discard incomplete chunks when there is a remainder", async () => {
      const totalSize = 8;
      for (const outputChunkSize of [3,5,6,7]) {
				for (const inputChunkSize of [8]) {
          const input = createChunkes(totalSize, inputChunkSize);
          // remove the last chunk
          const output = createChunkes(totalSize, outputChunkSize).slice(0, -1);
          const transformer = new FixedChunkStream(outputChunkSize, {
            discardIncompleteChunks: true,
          });
          const [chunks, collector] = createChunkCollector();
          await createReadableStream(input).pipeThrough(transformer).pipeTo(collector);
          expect(chunks).toHaveLength(output.length );
          expect(chunks).toEqual(output);
        }
      }
    })
  })
});
