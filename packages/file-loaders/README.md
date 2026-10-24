# @azzar/file-loaders

`@azzar/file-loaders` loads files from local paths and converts their content into standardized `Document` object arrays.

It provides one interface for reading different file formats, extracting their core text content, and preparing them for what comes next: file preview, content extraction, or knowledge base ingestion inside AZZAR.

## Features

- **Unified interface**: `loadFile(filePath: string)` is the core entry point.
- **Automatic type detection**: picks the right loader from the file extension.
- **Format support**:
  - **Plain text**: `.txt`, `.csv`, `.md`, `.json`, `.xml`, `.yaml`, `.html` and various code and configuration formats.
  - **PDF**: `.pdf` files.
  - **Word**: `.docx` files.
  - **Excel**: `.xlsx`, `.xls` files, one `Page` per worksheet.
  - **PowerPoint**: `.pptx` files, one `Page` per slide.
  - **Jupyter Notebook**: `.ipynb` files, converted to markdown (one page per cell); token-heavy outputs become short sized placeholders.
- **Standardized output**: always returns `Promise<Document>`. A `Document` holds an array of `Page` objects, the logical units of the file (pages, slides, worksheets, text blocks).
- **Hierarchical structure**: `Document` contains `Page[]`, which mirrors the original organization of the file.
- **Rich metadata**: detailed metadata at both `Document` and `Page` level, including file info, content statistics, and structural info.

## Core data structures

`loadFile` returns a `FileDocument`: file-level information plus all its logical pages/blocks (`DocumentPage`).

### `FileDocument` interface

| Field             | Type              | Description                                                                           |
| :---------------- | :---------------- | :------------------------------------------------------------------------------------ |
| `content`         | `string`          | File content (aggregated content)                                                     |
| `createdTime`     | `Date`            | File creation timestamp.                                                              |
| `fileType`        | `string`          | File type or extension.                                                               |
| `filename`        | `string`          | Original filename.                                                                    |
| `metadata`        | `object`          | File-level metadata.                                                                  |
| `metadata.author` | `string?`         | Document author (if available).                                                       |
| `metadata.error`  | `string?`         | Error information if the entire file loading failed.                                  |
| `metadata.title`  | `string?`         | Document title (if available).                                                        |
| `...`             | `any`             | Other file-level metadata.                                                            |
| `modifiedTime`    | `Date`            | File last modified timestamp.                                                       |
| `pages`           | `DocumentPage[]?` | Array containing all logical pages/blocks in the document (optional).                 |
| `source`          | `string`          | Full path of the original file.                                                       |
| `totalCharCount`  | `number`          | Total character count of the entire document (sum of all `DocumentPage` `charCount`). |
| `totalLineCount`  | `number`          | Total line count of the entire document (sum of all `DocumentPage` `lineCount`).      |

### `DocumentPage` interface

| Field                      | Type      | Description                                     |
| :------------------------- | :-------- | :---------------------------------------------- |
| `charCount`                | `number`  | Character count of this page/block content.     |
| `lineCount`                | `number`  | Line count of this page/block content.          |
| `metadata`                 | `object`  | Metadata related to this page/block.            |
| `metadata.chunkIndex`      | `number?` | Current chunk index if split into chunks.       |
| `metadata.error`           | `string?` | Error occurred when processing this page/block. |
| `metadata.lineNumberEnd`   | `number?` | End line number in the original file.           |
| `metadata.lineNumberStart` | `number?` | Start line number in the original file.         |
| `metadata.pageNumber`      | `number?` | Page number (applicable to PDF, DOCX).          |
| `metadata.sectionTitle`    | `string?` | Related section title.                          |
| `metadata.sheetName`       | `string?` | Worksheet name (applicable to XLSX).            |
| `metadata.slideNumber`     | `number?` | Slide number (applicable to PPTX).              |
| `metadata.totalChunks`     | `number?` | Total chunks if split into chunks.              |
| `...`                      | `any`     | Other page/block-specific metadata.             |
| `pageContent`              | `string`  | Core text content of this page/block.           |

## Contribution

File formats and parsing requirements keep evolving. Contributions that expand format support or improve parsing accuracy are welcome:

1. **New file format support**: add support for additional file types
2. **Parser improvements**: better content extraction from existing parsers
3. **Metadata enhancement**: richer metadata extraction
4. **Performance optimization**: faster file loading and processing

To contribute, clone the [AZZAR repository](https://github.com/hazemelerefey/azzar-agent), make the change, and submit a pull request describing the new formats or improvements, the test samples used, the performance impact, and the documentation updates.

## Note

This is an internal module of AZZAR (`"private": true`), built for AZZAR and not published as a standalone package.
