# @kawaz/fixed-chunk-stream

A lightweight TypeScript library that transforms streams into fixed-size chunks. This utility class extends TransformStream to provide efficient chunking of byte streams with configurable behavior for handling incomplete chunks.

## Features

- Transform byte streams into fixed-size chunks
- TypeScript support with full type definitions
- Configurable handling of incomplete chunks at stream end
- Zero dependencies
- Works with Web Streams API

## Installation

```bash
# Using npm
npm install @kawaz/fixed-chunk-stream

# Using yarn
yarn add @kawaz/fixed-chunk-stream

# Using bun
bun add @kawaz/fixed-chunk-stream
```

## Usage

### Basic Example

```typescript
import { FixedChunkStream } from '@kawaz/fixed-chunk-stream';

// Create a stream that outputs 1KB chunks
const chunkStream = new FixedChunkStream(1024);

// Use it in a pipeline
await sourceStream
  .pipeThrough(chunkStream)
  .pipeTo(destinationStream);
```

### Handling Incomplete Chunks

By default, any remaining bytes that cannot form a complete chunk at the end of the stream are emitted as a smaller chunk. You can change this behavior by setting `discardIncompleteChunks` to `true`.

```typescript
// Discard incomplete chunks at the end of the stream
const chunkStream = new FixedChunkStream(1024, {
  discardIncompleteChunks: true
});
```

### Complete Example

```typescript
// Example: Reading a file in chunks
const response = await fetch('large-file.bin');
const reader = response.body
  .pipeThrough(new FixedChunkStream(1024))
  .getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  // Each value is a Uint8Array of exactly 1024 bytes
  // (except possibly the last chunk if discardIncompleteChunks is false)
  console.log('Chunk size:', value.length);
}
```

## Development

This project uses [Bun](https://bun.sh) for development. Make sure you have it installed.

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the project
bun run build
```

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Author

Yoshiaki Kawazu

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you have any questions or run into issues, please open an issue on the [GitHub repository](https://github.com/kawaz/fixed-chunk-stream/issues).
