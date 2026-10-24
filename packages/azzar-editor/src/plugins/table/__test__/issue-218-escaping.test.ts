import { $isTableNode } from '@lexical/table';
import { $getRoot, $isElementNode } from 'lexical';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import Editor from '../../../editor-kernel';
import { CodePlugin } from '../../code';
import { CommonPlugin } from '../../common';
import { LitexmlPlugin } from '../../litexml';
import { MarkdownPlugin } from '../../markdown';
import type { IEditor } from '../../../types';

import { TablePlugin } from '../plugin';

describe('table Markdown escaping for issue #218', () => {
  let editor: IEditor;

  beforeEach(() => {
    editor = Editor.createEditor();
    editor.registerPlugins([LitexmlPlugin, MarkdownPlugin, CommonPlugin, CodePlugin, TablePlugin]);
    editor.initNodeEditor();
  });

  afterEach(() => {
    editor.destroy();
  });

  const getTableShapeAndCellText = () =>
    editor
      .getLexicalEditor()!
      .getEditorState()
      .read(() => {
        const table = $getRoot().getFirstChild();
        if (!$isTableNode(table)) {
          return { cellText: '', columns: [] };
        }

        const rows = table.getChildren();
        const bodyRow = rows[1];
        return {
          cellText: $isElementNode(bodyRow)
            ? (bodyRow.getChildren()[1]?.getTextContent().replaceAll('\uFEFF', '') ?? '')
            : '',
          columns: rows.map((row) => ($isElementNode(row) ? row.getChildrenSize() : 0)),
        };
      });

  it('preserves literal backslashes, already-escaped text, and pipes in a three-column table', () => {
    const sourceText = [
      'D:\\azzar\\{id}_search\\',
      'trailing\\',
      'already\\_escaped',
      'already\\|escaped',
      'left|right',
    ].join(' / ');
    editor.setDocument(
      'litexml',
      `<table><tr><td><span>a</span></td><td><span>b</span></td><td><span>c</span></td></tr>` +
        `<tr><td><span>x</span></td><td><span>${sourceText}</span></td><td><span>z</span></td></tr></table>`,
    );

    const markdown = editor.getDocument('markdown') as unknown as string;
    editor.setDocument('markdown', markdown);
    expect(getTableShapeAndCellText()).toEqual({ cellText: sourceText, columns: [3, 3] });
  });

  it('leaves inline code backslashes untouched', () => {
    const codeText = 'D:\\azzar\\{id}_search\\';
    editor.setDocument(
      'litexml',
      `<table><tr><td><span>a</span></td><td><span>b</span></td><td><span>c</span></td></tr>` +
        `<tr><td><span>x</span></td><td><codeInline><span>${codeText}</span></codeInline></td><td><span>z</span></td></tr></table>`,
    );

    const markdown = editor.getDocument('markdown') as unknown as string;
    editor.setDocument('markdown', markdown);
    expect(getTableShapeAndCellText()).toEqual({ cellText: codeText, columns: [3, 3] });
  });
});
