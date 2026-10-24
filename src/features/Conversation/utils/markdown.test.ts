import { describe, expect, it } from 'vitest';

import { normalizeThinkTags, processWithArtifact } from './markdown';

describe('processWithArtifact', () => {
  it('should removeLineBreaks with closed tag', () => {
    const input = `好的

<azzarArtifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
<defs>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');
</style>
</defs>
<!-- 背景 -->
<rect width="400" height="600" fill="#F0EAD6"/>
<!-- 总结 -->
<text x="200" y="500" font-family="'Noto Serif SC', serif" font-size="20" text-anchor="middle" fill="#8B4513">睡觉：生产力的假死，创造力的重生。</text>
</svg>
</azzarArtifact>`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`好的

<azzarArtifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><style>@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');</style></defs><!-- 背景 --><rect width="400" height="600" fill="#F0EAD6"/><!-- 总结 --><text x="200" y="500" font-family="'Noto Serif SC', serif" font-size="20" text-anchor="middle" fill="#8B4513">睡觉：生产力的假死，创造力的重生。</text></svg></azzarArtifact>`);
  });

  it('should removeLineBreaks with open tag', () => {
    const input = `好的

<azzarArtifact identifier="ai-interpretation-card" type="image/svg+xml" title="人工智能新解卡片">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');
    </style>
  </defs>
`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`好的

<azzarArtifact identifier="ai-interpretation-card" type="image/svg+xml" title="人工智能新解卡片"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">  <defs>    <style>      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');    </style>  </defs>`);
  });
  it('should not throw error with empty', () => {
    const input = '';

    const output = processWithArtifact(input);

    expect(output).toEqual('');
  });

  describe('close the <azzarArtifact tag', () => {
    it('close tag for <azzarArtifact', () => {
      const input = '<azzarArtifact';

      const output = processWithArtifact(input);

      expect(output).toEqual('<azzarArtifact>');
    });

    it('close tag for <azzarArtifact identifier="something"', () => {
      const input = '<azzarArtifact identifier="something"';

      const output = processWithArtifact(input);

      expect(output).toEqual('<azzarArtifact>');
    });

    it('close tag for <azzarArtifact identifier="ai-interpretation" type="image/svg+xml" titl', () => {
      const input = '<azzarArtifact identifier="ai-interpretation" type="image/svg+xml" titl';

      const output = processWithArtifact(input);

      expect(output).toEqual('<azzarArtifact>');
    });

    it('only change the <azzarArtifact> part', () => {
      const input = `好的,让我来用新的视角解释"人工智能"这个词汇。

<azzarThinking>这个词汇涉及了当代科技和社会热点,需要用批判性和幽默感来解读其本质。我会用隐喻和讽刺来表达,同时保持简洁有力。</azzarThinking>

<azzarArtifact identifier="ai-new-interpretation" type="image/svg+xml" t`;

      const output = processWithArtifact(input);

      expect(output).toEqual(`好的,让我来用新的视角解释"人工智能"这个词汇。

<azzarThinking>这个词汇涉及了当代科技和社会热点,需要用批判性和幽默感来解读其本质。我会用隐喻和讽刺来表达,同时保持简洁有力。</azzarThinking>

<azzarArtifact>`);
    });

    it('not change for <azzarArtifact />', () => {
      const input = '<azzarArtifact/>';

      const output = processWithArtifact(input);

      expect(output).toEqual(input);
    });
  });

  it('should removeLinkBreaks for azzarThinking', () => {
    const input = `好的,让我以一个特别的视角来解释"人工智能"这个词汇。

<azzarThinking>
这个词汇涉及了当代科技和社会热点,需要用批判性、幽默而深刻的视角来解读。我会运用隐喻和讽刺,抓住其本质,并以精练的方式表达出来。这符合一个好的artifact的标准,因为它是一个独立的、可能被用户修改或重用的内容。我将创建一个新的SVG artifact来呈现这个解释。
</azzarThinking>

<azzarArtifact identifier="ai-new-interpretation" type="image/svg+xml" title="人工智能的新解释">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');
      .background { fill: #f0f0f0; }
      .title { font-family: 'Noto Serif SC', serif; font-size: 28px; font-weight: 700; fill: #333; }
      .content { font-family: 'Noto Serif SC', serif; font-size: 18px; fill: #555; }
      .divider { stroke: #999; stroke-width: 1; }
      .decoration { fill: none; stroke: #999; stroke-width: 1; }
    </style>
  </defs>
</svg>
</azzarArtifact>

我为"人工智能"这个词创建了一个新的解释,并将其呈现在一个SVG卡片中。这个解释采用了批判性和幽默的视角,试图揭示这个概念背后的一些潜在问题。`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`好的,让我以一个特别的视角来解释"人工智能"这个词汇。

<azzarThinking>这个词汇涉及了当代科技和社会热点,需要用批判性、幽默而深刻的视角来解读。我会运用隐喻和讽刺,抓住其本质,并以精练的方式表达出来。这符合一个好的artifact的标准,因为它是一个独立的、可能被用户修改或重用的内容。我将创建一个新的SVG artifact来呈现这个解释。</azzarThinking>

<azzarArtifact identifier="ai-new-interpretation" type="image/svg+xml" title="人工智能的新解释"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">  <defs>    <style>      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');      .background { fill: #f0f0f0; }      .title { font-family: 'Noto Serif SC', serif; font-size: 28px; font-weight: 700; fill: #333; }      .content { font-family: 'Noto Serif SC', serif; font-size: 18px; fill: #555; }      .divider { stroke: #999; stroke-width: 1; }      .decoration { fill: none; stroke: #999; stroke-width: 1; }    </style>  </defs></svg></azzarArtifact>

我为"人工智能"这个词创建了一个新的解释,并将其呈现在一个SVG卡片中。这个解释采用了批判性和幽默的视角,试图揭示这个概念背后的一些潜在问题。`);
  });

  it('should removeLinkBreaks for azzarThinking', () => {
    const input = `<azzarThinking>
这个词汇涉及了
`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`<azzarThinking>这个词汇涉及了`);
  });

  it('should handle no empty line between azzarThinking and azzarArtifact', () => {
    const input = `<azzarThinking>这是一个思考过程。</azzarThinking>
<azzarArtifact identifier="test" type="image/svg+xml" title="测试">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="blue"/>
</svg>
</azzarArtifact>`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`<azzarThinking>这是一个思考过程。</azzarThinking>

<azzarArtifact identifier="test" type="image/svg+xml" title="测试"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">  <rect width="100" height="100" fill="blue"/></svg></azzarArtifact>`);
  });

  it('should handle Gemini case with no line break between azzarThinking and azzarArtifact tags', () => {
    const input = `<azzarThinking>这是一个思考过程。</azzarThinking><azzarArtifact identifier="test" type="image/svg+xml" title="测试">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="blue"/>
</svg>
</azzarArtifact>`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`<azzarThinking>这是一个思考过程。</azzarThinking>

<azzarArtifact identifier="test" type="image/svg+xml" title="测试"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">  <rect width="100" height="100" fill="blue"/></svg></azzarArtifact>`);
  });

  it('should remove fenced code block between azzarArtifact and HTML content', () => {
    const input = `<azzarArtifact identifier="web-calculator" type="text/html" title="简单的 Web 计算器">
\`\`\`html
<!DOCTYPE html>
<html lang="zh">
<head>
  <title>计算器</title>
</head>
<body>
  <div>计算器</div>
</body>
</html>
\`\`\`
</azzarArtifact>`;

    const output = processWithArtifact(input);

    expect(output).toEqual(
      `<azzarArtifact identifier="web-calculator" type="text/html" title="简单的 Web 计算器"><!DOCTYPE html><html lang="zh"><head>  <title>计算器</title></head><body>  <div>计算器</div></body></html></azzarArtifact>`,
    );
  });

  it('should remove fenced code block between azzarArtifact and HTML content without doctype', () => {
    const input = `<azzarArtifact identifier="web-calculator" type="text/html" title="简单的 Web 计算器">
\`\`\`html
<html lang="zh">
<head>
  <title>计算器</title>
</head>
<body>
  <div>计算器</div>
</body>
</html>
\`\`\`
</azzarArtifact>`;

    const output = processWithArtifact(input);

    expect(output).toEqual(
      `<azzarArtifact identifier="web-calculator" type="text/html" title="简单的 Web 计算器"><html lang="zh"><head>  <title>计算器</title></head><body>  <div>计算器</div></body></html></azzarArtifact>`,
    );
  });

  it('should remove outer fenced code block wrapping azzarThinking and azzarArtifact', () => {
    const input =
      '```tool_code\n<azzarThinking>这是一个思考过程。</azzarThinking>\n\n<azzarArtifact identifier="test" type="text/html" title="测试">\n<div>测试内容</div>\n</azzarArtifact>\n```';

    const output = processWithArtifact(input);

    expect(output).toEqual(
      '<azzarThinking>这是一个思考过程。</azzarThinking>\n\n<azzarArtifact identifier="test" type="text/html" title="测试"><div>测试内容</div></azzarArtifact>',
    );
  });

  it('should handle both outer code block and inner HTML code block', () => {
    const input =
      '```tool_code\n<azzarThinking>这是一个思考过程。</azzarThinking>\n\n<azzarArtifact identifier="test" type="text/html" title="测试">\n```html\n<!DOCTYPE html>\n<html>\n<body>\n<div>测试内容</div>\n</body>\n</html>\n```\n</azzarArtifact>\n```';

    const output = processWithArtifact(input);

    expect(output).toEqual(
      '<azzarThinking>这是一个思考过程。</azzarThinking>\n\n<azzarArtifact identifier="test" type="text/html" title="测试"><!DOCTYPE html><html><body><div>测试内容</div></body></html></azzarArtifact>',
    );
  });

  it('should handle complete conversation with text and tags', () => {
    const input = `Sure, I can help you with that! Here is a basic calculator built using HTML, CSS, and JavaScript.

<azzarThinking>A web calculator is a substantial piece of code and a good candidate for an artifact. It's self-contained, and it's likely that the user will want to modify it. This is a new request, so I will create a new artifact.</azzarThinking>

<azzarArtifact identifier="web-calculator" type="text/html" title="Web Calculator">
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Simple Calculator</title>
</head>
<body>
    <div>Calculator</div>
</body>
</html>
\`\`\`
</azzarArtifact>

This code provides a basic calculator that can perform addition, subtraction, multiplication, and division.`;

    const output = processWithArtifact(input);

    expect(output)
      .toEqual(`Sure, I can help you with that! Here is a basic calculator built using HTML, CSS, and JavaScript.

<azzarThinking>A web calculator is a substantial piece of code and a good candidate for an artifact. It's self-contained, and it's likely that the user will want to modify it. This is a new request, so I will create a new artifact.</azzarThinking>

<azzarArtifact identifier="web-calculator" type="text/html" title="Web Calculator"><!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <title>Simple Calculator</title></head><body>    <div>Calculator</div></body></html></azzarArtifact>

This code provides a basic calculator that can perform addition, subtraction, multiplication, and division.`);
  });

  it('should remove line breaks from multiple artifact tags in the same message', () => {
    const input = `Here are two artifacts:

<azzarArtifact identifier="first-artifact" type="text/markdown" title="First">
Line 1
Line 2
</azzarArtifact>

<azzarArtifact identifier="second-artifact" type="text/markdown" title="Second">
Line A
Line B
</azzarArtifact>

Done.`;

    const output = processWithArtifact(input);

    // Both artifacts should have their newlines removed
    expect(output).toEqual(`Here are two artifacts:

<azzarArtifact identifier="first-artifact" type="text/markdown" title="First">Line 1Line 2</azzarArtifact>

<azzarArtifact identifier="second-artifact" type="text/markdown" title="Second">Line ALine B</azzarArtifact>

Done.`);
  });

  it('should handle multiple artifacts where second is still generating (unclosed)', () => {
    const input = `Two artifacts:

<azzarArtifact identifier="done" type="text/markdown" title="Done">
Content 1
</azzarArtifact>

<azzarArtifact identifier="generating" type="text/markdown" title="Generating">
Content 2 still going`;

    const output = processWithArtifact(input);

    // Both artifacts should have newlines removed, even the unclosed one
    expect(output).toEqual(`Two artifacts:

<azzarArtifact identifier="done" type="text/markdown" title="Done">Content 1</azzarArtifact>

<azzarArtifact identifier="generating" type="text/markdown" title="Generating">Content 2 still going`);
  });

  it('should keep HTML script blocks inside flattened artifact markup', () => {
    const input = `<azzarArtifact identifier="snake-game" type="text/html" title="Snake Game">
<!DOCTYPE html>
<html>
<body>
<script>
// Move the snake every frame
const url = " // keep string content untouched";
window.snakeStarted = true;
</script${'\t'}
 bar>
</body>
</html>
</azzarArtifact>`;

    const output = processWithArtifact(input);

    expect(output).toContain(
      '<azzarArtifact identifier="snake-game" type="text/html" title="Snake Game"><!DOCTYPE html><html><body><script>// Move the snake every frameconst url = " // keep string content untouched";window.snakeStarted = true;</script\t bar></body></html></azzarArtifact>',
    );
    expect(output).not.toContain('<script>\n');
  });
});

describe('outer code block removal', () => {
  it('should remove outer html code block', () => {
    const input = `\`\`\`html
<azzarThinking>Test thinking</azzarThinking>
<azzarArtifact identifier="test" type="text/html" title="Test">
<!DOCTYPE html>
<html>
<body>Test</body>
</html>
</azzarArtifact>
\`\`\``;

    const output = processWithArtifact(input);

    expect(output).toEqual(`<azzarThinking>Test thinking</azzarThinking>

<azzarArtifact identifier="test" type="text/html" title="Test"><!DOCTYPE html><html><body>Test</body></html></azzarArtifact>`);
  });

  it('should remove outer tool_code code block', () => {
    const input = `\`\`\`tool_code
<azzarThinking>Test thinking</azzarThinking>
<azzarArtifact identifier="test" type="text/html" title="Test">
<!DOCTYPE html>
<html>
<body>Test</body>
</html>
</azzarArtifact>
\`\`\``;

    const output = processWithArtifact(input);

    expect(output).toEqual(`<azzarThinking>Test thinking</azzarThinking>

<azzarArtifact identifier="test" type="text/html" title="Test"><!DOCTYPE html><html><body>Test</body></html></azzarArtifact>`);
  });

  it('should handle input without outer code block', () => {
    const input = `<azzarThinking>Test thinking</azzarThinking>
<azzarArtifact identifier="test" type="text/html" title="Test">
<!DOCTYPE html>
<html>
<body>Test</body>
</html>
</azzarArtifact>`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`<azzarThinking>Test thinking</azzarThinking>

<azzarArtifact identifier="test" type="text/html" title="Test"><!DOCTYPE html><html><body>Test</body></html></azzarArtifact>`);
  });

  it('should handle code block with content before and after', () => {
    const input = `Some text before

\`\`\`html
<azzarThinking>Test thinking</azzarThinking>

<azzarArtifact identifier="test" type="text/html" title="Test">
<!DOCTYPE html>
<html>
<body>Test</body>
</html>
</azzarArtifact>
\`\`\`

Some text after`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`Some text before

<azzarThinking>Test thinking</azzarThinking>

<azzarArtifact identifier="test" type="text/html" title="Test"><!DOCTYPE html><html><body>Test</body></html></azzarArtifact>

Some text after`);
  });

  it('should handle code block with only azzarArtifact tag', () => {
    const input = `\`\`\`html
<azzarArtifact identifier="test" type="text/html" title="Test">
<!DOCTYPE html>
<html>
<body>Test</body>
</html>
</azzarArtifact>
\`\`\``;

    const output = processWithArtifact(input);

    expect(output).toEqual(
      `<azzarArtifact identifier="test" type="text/html" title="Test"><!DOCTYPE html><html><body>Test</body></html></azzarArtifact>`,
    );
  });

  it('should handle code block with surrounding text and both azzarThinking and azzarArtifact', () => {
    const input = `---

\`\`\`tool_code
<azzarThinking>The user reported a \`SyntaxError\` in the browser console, indicating a problem with the JavaScript code in the calculator artifact. The error message "Identifier 'display' has already been declared" suggests a variable naming conflict. I need to review the JavaScript code and correct the issue. This is an update to the existing "calculator-web-artifact" artifact.</azzarThinking>
<azzarArtifact identifier="calculator-web-artifact" type="text/html" title="Simple Calculator">
<!DOCTYPE html>
<html lang="en">
...
</html>
</azzarArtifact>
\`\`\`
I've updated the calculator artifact. The issue was a naming conflict with the \`display\` variable. I've renamed the input element's ID to \`calc-display\` and the JavaScript variable to \`displayElement\` to avoid the conflict. The calculator should now function correctly.

---`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`---

<azzarThinking>The user reported a \`SyntaxError\` in the browser console, indicating a problem with the JavaScript code in the calculator artifact. The error message "Identifier 'display' has already been declared" suggests a variable naming conflict. I need to review the JavaScript code and correct the issue. This is an update to the existing "calculator-web-artifact" artifact.</azzarThinking>

<azzarArtifact identifier="calculator-web-artifact" type="text/html" title="Simple Calculator"><!DOCTYPE html><html lang="en">...</html></azzarArtifact>

I've updated the calculator artifact. The issue was a naming conflict with the \`display\` variable. I've renamed the input element's ID to \`calc-display\` and the JavaScript variable to \`displayElement\` to avoid the conflict. The calculator should now function correctly.

---`);
  });

  it('should handle code block before azzarThinking and azzarArtifact', () => {
    const input = `
Okay, I'll create a temperature converter with the logic wrapped in an IIFE and event listeners attached in Javascript.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
...
</html>
\`\`\`

<azzarThinking>This is a good candidate for an artifact. It's a self-contained HTML document with embedded JavaScript that provides a functional temperature converter. It's more than a simple code snippet and can be reused or modified. This is a new request, so I'll create a new artifact with the identifier "temperature-converter".</azzarThinking>

<azzarArtifact identifier="temperature-converter" type="text/html" title="Temperature Converter">
\`\`\`html
<!DOCTYPE html>
<html lang="en">
...
</html>
\`\`\`
</azzarArtifact>
This HTML document includes the temperature converter with the requested features: the logic is wrapped in an IIFE, and event listeners are attached in JavaScript.
`;

    const output = processWithArtifact(input);

    expect(output)
      .toEqual(`Okay, I'll create a temperature converter with the logic wrapped in an IIFE and event listeners attached in Javascript.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
...
</html>
\`\`\`

<azzarThinking>This is a good candidate for an artifact. It's a self-contained HTML document with embedded JavaScript that provides a functional temperature converter. It's more than a simple code snippet and can be reused or modified. This is a new request, so I'll create a new artifact with the identifier "temperature-converter".</azzarThinking>

<azzarArtifact identifier="temperature-converter" type="text/html" title="Temperature Converter"><!DOCTYPE html><html lang="en">...</html></azzarArtifact>

This HTML document includes the temperature converter with the requested features: the logic is wrapped in an IIFE, and event listeners are attached in JavaScript.`);
  });

  describe('idempotency tests', () => {
    it('should not add extra blank lines when running processWithArtifact multiple times', () => {
      const input = `<azzarThinking>这是一个思考过程。</azzarThinking><azzarArtifact identifier="test" type="image/svg+xml" title="测试">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="blue"/>
</svg>
</azzarArtifact>`;

      // First run
      const firstRun = processWithArtifact(input);

      // Second run - should produce the same result
      const secondRun = processWithArtifact(firstRun);

      // Third run - should still produce the same result
      const thirdRun = processWithArtifact(secondRun);

      // All runs should produce the same output
      expect(firstRun).toEqual(secondRun);
      expect(secondRun).toEqual(thirdRun);

      // Verify the output has exactly two newlines between tags
      expect(firstRun).toContain('</azzarThinking>\n\n<azzarArtifact');
      expect(firstRun.match(/(<\/azzarThinking>)\n\n(<azzarArtifact)/)).toBeTruthy();
    });

    it('should handle already processed content with proper spacing', () => {
      const alreadyProcessed = `<azzarThinking>这是一个思考过程。</azzarThinking>

<azzarArtifact identifier="test" type="image/svg+xml" title="测试"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">  <rect width="100" height="100" fill="blue"/></svg></azzarArtifact>`;

      const result = processWithArtifact(alreadyProcessed);

      // Should remain unchanged
      expect(result).toEqual(alreadyProcessed);
    });

    it('should not convert spaces between tags into extra blank lines', () => {
      const inputWithSpaces = `<azzarThinking>这是一个思考过程。</azzarThinking> <azzarArtifact identifier="test" type="image/svg+xml" title="测试">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="blue"/>
</svg>
</azzarArtifact>`;

      const output = processWithArtifact(inputWithSpaces);

      // Should still have the space and not convert it to newlines
      expect(output).toContain('</azzarThinking> <azzarArtifact');
      expect(output).not.toContain('</azzarThinking>\n\n<azzarArtifact');
    });
  });

  describe('azzarAgents tag', () => {
    it('strips newlines inside a self-closing tag whose attributes span lines', () => {
      const input = `<azzarAgents
  identifier="session-abc"
  title="高密度信息图生成器"
/>`;

      const output = processWithArtifact(input);

      expect(output).toEqual('<azzarAgents  identifier="session-abc"  title="高密度信息图生成器"/>');
    });

    it('preserves trailing block-level Markdown after a self-closing tag', () => {
      const input = `<azzarAgents identifier="session-abc" title="高密度信息图生成器" />

---
### 这个 Agent 的核心能力：

| 维度 | 说明 |
|------|------|
| 风格 | 实验室精密手册感 |`;

      const output = processWithArtifact(input);

      expect(output).toEqual(input);
    });

    it('does not swallow trailing Markdown when the model omits the self-closing slash', () => {
      // Some models (e.g. deepseek) emit a bare opening tag without `/>`.
      // The newline stripper must still only touch the tag, not the rest.
      const input = `<azzarAgents identifier="session-abc" title="高密度信息图生成器">

---
### 这个 Agent 的核心能力：

| 维度 | 说明 |
|------|------|`;

      const output = processWithArtifact(input);

      expect(output).toEqual(input);
    });
  });
});

describe('normalizeThinkTags', () => {
  it('should only parse a <think> tag at the start of the message', () => {
    const input = `<think>用户想要一个训练方案。</think>以下是方案：`;
    const output = normalizeThinkTags(input);

    expect(output).toEqual('<think>\n\n用户想要一个训练方案。\n\n</think>\n\n以下是方案：');
  });

  it('should not touch a <think> tag in the middle of the message', () => {
    const input = '基座默认先吐一段 `<think>` 标签，要额外 pin 参数才行。';
    const output = normalizeThinkTags(input);

    expect(output).toEqual(input);
  });

  it('should not touch a <think> tag appearing after body text', () => {
    const input = `先说结论：可行。

<think>推理过程</think>

然后是正文。`;
    const output = normalizeThinkTags(input);

    expect(output).toEqual(input);
  });

  it('should normalize when the message starts with a leading-newline <think> tag', () => {
    const input = '\n<think>思考</think>正文';
    const output = normalizeThinkTags(input);

    expect(output).toEqual('\n<think>\n\n思考\n\n</think>\n\n正文');
  });

  it('should only add the opening gap for an unclosed leading <think> tag', () => {
    const input = '<think>还在思考';
    const output = normalizeThinkTags(input);

    expect(output).toEqual('<think>\n\n还在思考');
  });
});
