import type { CanvasAttributeSpec, CanvasComponentSpec } from './types';

export const CANVAS_TAG_PREFIX = 'azzar-';

export const CANVAS_PALETTE = [
  'red',
  'volcano',
  'orange',
  'gold',
  'yellow',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
  'magenta',
  'gray',
] as const;

export const CANVAS_VALUE_FORMATS = ['number', 'compact', 'percent', 'currency'] as const;

export const CANVAS_CODE_LANGUAGES = [
  'bash',
  'c',
  'cpp',
  'csharp',
  'css',
  'diff',
  'dockerfile',
  'go',
  'html',
  'java',
  'javascript',
  'json',
  'jsx',
  'kotlin',
  'python',
  'ruby',
  'rust',
  'sql',
  'swift',
  'toml',
  'tsx',
  'typescript',
  'yaml',
] as const;

const size: CanvasAttributeSpec = {
  description: 'Control size.',
  type: 'enum',
  values: ['small', 'middle', 'large'],
};

const gap: CanvasAttributeSpec = { description: 'Gap between children in px.', type: 'number' };

const optionValue: CanvasAttributeSpec = {
  description: 'Value of the selected option; matches a child <azzar-option value>.',
  type: 'string',
};

const disabled: CanvasAttributeSpec = { description: 'Disable the control.', type: 'boolean' };

const chartAttributes: Record<string, CanvasAttributeSpec> = {
  'categories': {
    description: 'JSON array of the data keys to plot as series.',
    required: true,
    type: 'json',
  },
  'colors': {
    description: `JSON array of palette names, one per category: ${CANVAS_PALETTE.join(', ')}.`,
    type: 'json',
  },
  'data': {
    description: 'JSON array of row objects.',
    required: true,
    type: 'json',
  },
  'height': { description: 'Chart height in px. Default 280.', type: 'number' },
  'index': { description: 'Row key used for the x axis.', required: true, type: 'string' },
  'show-legend': { description: 'Show the legend. Default true.', type: 'boolean' },
  'unit': { description: 'Unit appended to formatted values, e.g. "ms".', type: 'string' },
  'value-format': {
    description: 'How values are formatted.',
    type: 'enum',
    values: CANVAS_VALUE_FORMATS,
  },
};

const chart = (
  tag: string,
  description: string,
  extra: Record<string, CanvasAttributeSpec> = {},
): CanvasComponentSpec => ({
  attributes: { ...chartAttributes, ...extra },
  category: 'chart',
  children: 'none',
  description,
  example: `<${tag} index="month" categories='["cost"]' data='[{"month":"Sep","cost":1200},{"month":"Oct","cost":1840}]'></${tag}>`,
  tag,
});

export const CANVAS_COMPONENTS: readonly CanvasComponentSpec[] = [
  {
    attributes: {
      align: {
        description: 'Cross-axis alignment.',
        type: 'enum',
        values: ['start', 'center', 'end', 'stretch', 'baseline'],
      },
      gap,
      horizontal: { description: 'Lay children out in a row.', type: 'boolean' },
      justify: {
        description: 'Main-axis distribution.',
        type: 'enum',
        values: ['start', 'center', 'end', 'space-between', 'space-around'],
      },
      wrap: { description: 'Wrap children onto new lines.', type: 'boolean' },
    },
    category: 'layout',
    children: 'content',
    description: 'Flex container. Vertical by default.',
    example: '<azzar-flex horizontal gap="12" align="center">…</azzar-flex>',
    tag: 'azzar-flex',
  },
  {
    attributes: {
      'gap': gap,
      'max-item-width': {
        description: 'Maximum item width in px before wrapping to more columns.',
        type: 'number',
      },
      'rows': { description: 'Number of columns.', type: 'number' },
    },
    category: 'layout',
    children: 'content',
    description: 'Responsive grid. Use for stat rows and card grids.',
    example: '<azzar-grid rows="3" gap="12">…</azzar-grid>',
    tag: 'azzar-grid',
  },
  {
    attributes: {
      padding: { description: 'Inner padding in px. Default 16.', type: 'number' },
      title: { description: 'Card title.', type: 'string' },
      variant: {
        description: 'Surface style.',
        type: 'enum',
        values: ['outlined', 'filled', 'borderless'],
      },
    },
    category: 'layout',
    children: 'content',
    description: 'Card surface that groups related content.',
    example: '<azzar-card title="By model">…</azzar-card>',
    tag: 'azzar-card',
  },
  {
    attributes: {
      dashed: { description: 'Dashed line.', type: 'boolean' },
    },
    category: 'layout',
    children: 'none',
    description: 'Horizontal divider between sections.',
    example: '<azzar-divider></azzar-divider>',
    tag: 'azzar-divider',
  },
  {
    attributes: {
      value: { description: 'Key of the active tab.', type: 'string' },
    },
    category: 'layout',
    children: 'options',
    description: 'Tabs. Each <azzar-tab> child is one panel.',
    example:
      '<azzar-tabs value="model"><azzar-tab value="model" label="By model">…</azzar-tab><azzar-tab value="team" label="By team">…</azzar-tab></azzar-tabs>',
    tag: 'azzar-tabs',
  },
  {
    attributes: {
      label: { description: 'Tab label.', required: true, type: 'string' },
      value: { description: 'Tab key.', required: true, type: 'string' },
    },
    category: 'layout',
    children: 'content',
    description: 'One tab panel inside <azzar-tabs>.',
    example: '<azzar-tab value="model" label="By model">…</azzar-tab>',
    parents: ['azzar-tabs'],
    tag: 'azzar-tab',
  },
  {
    attributes: {},
    category: 'layout',
    children: 'options',
    description: 'Collapsible sections. Each <azzar-accordion-item> child is one section.',
    example:
      '<azzar-accordion><azzar-accordion-item title="Method">…</azzar-accordion-item></azzar-accordion>',
    tag: 'azzar-accordion',
  },
  {
    attributes: {
      open: { description: 'Expanded by default.', type: 'boolean' },
      title: { description: 'Section title.', required: true, type: 'string' },
    },
    category: 'layout',
    children: 'content',
    description: 'One collapsible section inside <azzar-accordion>.',
    example: '<azzar-accordion-item title="Method" open>…</azzar-accordion-item>',
    parents: ['azzar-accordion'],
    tag: 'azzar-accordion-item',
  },
  {
    attributes: {
      title: { description: 'Bold first line.', type: 'string' },
      type: {
        description: 'Meaning of the message.',
        type: 'enum',
        values: ['info', 'success', 'warning', 'error'],
      },
    },
    category: 'text',
    children: 'content',
    description: 'Callout for the conclusion or an important caveat.',
    example: '<azzar-alert type="info" title="Cost is up 23%">Almost all from Opus.</azzar-alert>',
    tag: 'azzar-alert',
  },
  {
    attributes: {
      color: { description: 'Palette color.', type: 'enum', values: CANVAS_PALETTE },
    },
    category: 'text',
    children: 'content',
    description: 'Short label or status tag.',
    example: '<azzar-tag color="green">Stable</azzar-tag>',
    tag: 'azzar-tag',
  },
  {
    attributes: {
      count: { description: 'Number shown in the badge.', type: 'number' },
      status: {
        description: 'Status dot.',
        type: 'enum',
        values: ['success', 'processing', 'default', 'error', 'warning'],
      },
      text: { description: 'Text next to the status dot.', type: 'string' },
    },
    category: 'text',
    children: 'content',
    description: 'Status dot or count badge.',
    example: '<azzar-badge status="success" text="Healthy"></azzar-badge>',
    tag: 'azzar-badge',
  },
  {
    attributes: {
      language: {
        description: `Code language or a common alias (ts, js, py, sh). Highlighted: ${CANVAS_CODE_LANGUAGES.join(', ')}; any other shows as plain text.`,
        type: 'string',
      },
    },
    category: 'text',
    children: 'text',
    description:
      'Code block with syntax highlighting and a copy button. The code is the text content: write < as &lt; and & as &amp;.',
    example:
      '<azzar-code language="ts">const ids: Array&lt;string&gt; = rows.map((row) =&gt; row.id);</azzar-code>',
    tag: 'azzar-code',
  },
  {
    attributes: {},
    category: 'chart',
    children: 'text',
    description:
      'Diagram drawn from Mermaid text: flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, gantt, timeline, mindmap and the other Mermaid types. Use it for every flowchart, sequence or architecture diagram instead of drawing SVG by hand. The diagram is the text content: write < as &lt; and & as &amp;. Invalid Mermaid is rejected with the parser error.',
    example:
      '<azzar-mermaid>\nflowchart TD\n  A[Request] --&gt; B{Token valid?}\n  B -- yes --&gt; C[Response]\n  B -- no --&gt; D[Refresh]\n</azzar-mermaid>',
    tag: 'azzar-mermaid',
  },
  {
    attributes: {
      'precision': { description: 'Decimal places.', type: 'number' },
      'prefix': { description: 'Text before the value, e.g. "$".', type: 'string' },
      'suffix': { description: 'Text after the value, e.g. "%".', type: 'string' },
      'title': { description: 'Label above the value.', required: true, type: 'string' },
      'trend': {
        description: 'Direction of change, shown next to the value.',
        type: 'enum',
        values: ['up', 'down', 'flat'],
      },
      'trend-text': { description: 'Change text, e.g. "+23% MoM".', type: 'string' },
      'value': { description: 'The number.', required: true, type: 'number' },
    },
    category: 'data',
    children: 'none',
    description: 'Key number with label and optional trend.',
    example:
      '<azzar-stat title="Total cost" value="18420" prefix="$" trend="up" trend-text="+23%"></azzar-stat>',
    tag: 'azzar-stat',
  },
  {
    attributes: {
      columns: {
        description:
          'JSON array of {"title","key","align"?:"left"|"right","format"?:"number"|"compact"|"percent"|"currency"}.',
        required: true,
        type: 'json',
      },
      data: { description: 'JSON array of row objects.', required: true, type: 'json' },
      striped: { description: 'Zebra rows.', type: 'boolean' },
    },
    category: 'data',
    children: 'none',
    description: 'Data table.',
    example:
      '<azzar-table columns=\'[{"title":"Model","key":"model"},{"title":"Cost","key":"cost","align":"right","format":"currency"}]\' data=\'[{"model":"Opus","cost":11236}]\'></azzar-table>',
    tag: 'azzar-table',
  },
  {
    attributes: {
      percent: { description: 'Progress 0–100.', required: true, type: 'number' },
      status: {
        description: 'Status color.',
        type: 'enum',
        values: ['normal', 'success', 'exception', 'active'],
      },
      type: { description: 'Shape.', type: 'enum', values: ['line', 'circle'] },
    },
    category: 'data',
    children: 'none',
    description: 'Progress bar or ring.',
    example: '<azzar-progress percent="61"></azzar-progress>',
    tag: 'azzar-progress',
  },
  {
    attributes: {
      items: {
        description:
          'JSON array of {"title","description"?,"status"?:"wait"|"process"|"finish"|"error"}.',
        required: true,
        type: 'json',
      },
      vertical: { description: 'Vertical timeline.', type: 'boolean' },
    },
    category: 'data',
    children: 'none',
    description: 'Ordered steps or a timeline.',
    example: '<azzar-steps vertical items=\'[{"title":"Collect","status":"finish"}]\'></azzar-steps>',
    tag: 'azzar-steps',
  },
  {
    attributes: {
      columns: { description: 'Items per row. Default 2.', type: 'number' },
      items: {
        description: 'JSON array of {"label","value"}.',
        required: true,
        type: 'json',
      },
    },
    category: 'data',
    children: 'none',
    description: 'Label/value pairs, e.g. metadata or a comparison.',
    example:
      '<azzar-descriptions items=\'[{"label":"Period","value":"Oct 2026"}]\'></azzar-descriptions>',
    tag: 'azzar-descriptions',
  },
  {
    attributes: {
      block: { description: 'Full width.', type: 'boolean' },
      disabled,
      size,
      type: {
        description: 'Visual weight.',
        type: 'enum',
        values: ['primary', 'default', 'text', 'link'],
      },
      value: { description: 'Value sent with the change event when clicked.', type: 'string' },
    },
    category: 'control',
    children: 'content',
    description: 'Button. Clicking fires azzar-change with its value.',
    example: '<azzar-button type="primary" value="refresh">Recalculate</azzar-button>',
    tag: 'azzar-button',
  },
  {
    attributes: {
      disabled,
      placeholder: { description: 'Placeholder text.', type: 'string' },
      size,
      value: optionValue,
    },
    category: 'control',
    children: 'options',
    description: 'Dropdown select with <azzar-option> children.',
    example:
      '<azzar-select id="range" value="30d"><azzar-option value="7d">7 days</azzar-option><azzar-option value="30d">30 days</azzar-option></azzar-select>',
    tag: 'azzar-select',
  },
  {
    attributes: { disabled, size, value: optionValue },
    category: 'control',
    children: 'options',
    description: 'Segmented switch between a few views, with <azzar-option> children.',
    example:
      '<azzar-segmented id="view" value="chart"><azzar-option value="chart">Chart</azzar-option><azzar-option value="table">Table</azzar-option></azzar-segmented>',
    tag: 'azzar-segmented',
  },
  {
    attributes: { disabled, value: optionValue },
    category: 'control',
    children: 'options',
    description: 'Radio group with <azzar-option> children.',
    example:
      '<azzar-radio-group value="a"><azzar-option value="a">A</azzar-option><azzar-option value="b">B</azzar-option></azzar-radio-group>',
    tag: 'azzar-radio-group',
  },
  {
    attributes: {
      disabled,
      value: { description: 'Option value.', required: true, type: 'string' },
    },
    category: 'control',
    children: 'content',
    description: 'One option inside a select, segmented or radio group. Text content is the label.',
    example: '<azzar-option value="7d">7 days</azzar-option>',
    parents: ['azzar-select', 'azzar-segmented', 'azzar-radio-group'],
    tag: 'azzar-option',
  },
  {
    attributes: {
      checked: { description: 'On by default.', type: 'boolean' },
      disabled,
      label: { description: 'Label next to the switch.', type: 'string' },
    },
    category: 'control',
    children: 'none',
    description: 'On/off switch.',
    example: '<azzar-switch id="cached" label="Include cached" checked></azzar-switch>',
    tag: 'azzar-switch',
  },
  {
    attributes: {
      checked: { description: 'Checked by default.', type: 'boolean' },
      disabled,
    },
    category: 'control',
    children: 'content',
    description: 'Checkbox. Text content is the label.',
    example: '<azzar-checkbox id="opus" checked>Opus</azzar-checkbox>',
    tag: 'azzar-checkbox',
  },
  {
    attributes: {
      disabled,
      placeholder: { description: 'Placeholder text.', type: 'string' },
      size,
      value: { description: 'Initial value.', type: 'string' },
    },
    category: 'control',
    children: 'none',
    description: 'Single-line text input.',
    example: '<azzar-input id="q" placeholder="Filter models"></azzar-input>',
    tag: 'azzar-input',
  },
  {
    attributes: {
      disabled,
      max: { description: 'Maximum. Default 100.', type: 'number' },
      min: { description: 'Minimum. Default 0.', type: 'number' },
      step: { description: 'Step. Default 1.', type: 'number' },
      value: { description: 'Initial value.', type: 'number' },
    },
    category: 'control',
    children: 'none',
    description: 'Slider for a numeric parameter.',
    example: '<azzar-slider id="share" min="0" max="100" value="40"></azzar-slider>',
    tag: 'azzar-slider',
  },
  chart('azzar-area-chart', 'Area chart for trends over time.', {
    stack: { description: 'Stack series.', type: 'boolean' },
  }),
  chart('azzar-bar-chart', 'Bar chart for comparing categories.', {
    layout: { description: 'Bar direction.', type: 'enum', values: ['horizontal', 'vertical'] },
    stack: { description: 'Stack series.', type: 'boolean' },
  }),
  chart('azzar-line-chart', 'Line chart for trends.'),
  {
    attributes: {
      'category': {
        description: 'Row key that groups points into series.',
        required: true,
        type: 'string',
      },
      'colors': chartAttributes.colors,
      'data': chartAttributes.data,
      'height': chartAttributes.height,
      'show-legend': chartAttributes['show-legend'],
      'size': { description: 'Row key that scales each point.', type: 'string' },
      'x': { description: 'Row key for the x value.', required: true, type: 'string' },
      'y': { description: 'Row key for the y value.', required: true, type: 'string' },
    },
    category: 'chart',
    children: 'none',
    description: 'Scatter chart for correlation between two measures.',
    example:
      '<azzar-scatter-chart x="latency" y="cost" category="model" data=\'[{"model":"Opus","latency":2.1,"cost":11}]\'></azzar-scatter-chart>',
    tag: 'azzar-scatter-chart',
  },
  chart('azzar-radar-chart', 'Radar chart for comparing a few items across several dimensions.'),
  {
    attributes: {
      'category': { description: 'Row key holding the value.', required: true, type: 'string' },
      'colors': chartAttributes.colors,
      'data': chartAttributes.data,
      'index': { description: 'Row key holding the slice name.', required: true, type: 'string' },
      'unit': chartAttributes.unit,
      'value-format': chartAttributes['value-format'],
      'variant': { description: 'Shape.', type: 'enum', values: ['donut', 'pie'] },
    },
    category: 'chart',
    children: 'none',
    description: 'Donut or pie chart for shares of a whole.',
    example:
      '<azzar-donut-chart index="model" category="cost" data=\'[{"model":"Opus","cost":61},{"model":"GPT","cost":22}]\'></azzar-donut-chart>',
    tag: 'azzar-donut-chart',
  },
  {
    attributes: {
      'data': {
        description: 'JSON array of {"name","value"}.',
        required: true,
        type: 'json',
      },
      'unit': chartAttributes.unit,
      'value-format': chartAttributes['value-format'],
    },
    category: 'chart',
    children: 'none',
    description: 'Ranked horizontal bars, best for top-N lists.',
    example: '<azzar-bar-list data=\'[{"name":"Code review","value":9870}]\'></azzar-bar-list>',
    tag: 'azzar-bar-list',
  },
  {
    attributes: {
      categories: chartAttributes.categories,
      colors: chartAttributes.colors,
      data: chartAttributes.data,
      index: chartAttributes.index,
      kind: { description: 'Shape.', type: 'enum', values: ['area', 'line', 'bar'] },
    },
    category: 'chart',
    children: 'none',
    description: 'Tiny inline trend chart without axes.',
    example:
      '<azzar-spark-chart kind="area" index="d" categories=\'["v"]\' data=\'[{"d":1,"v":3},{"d":2,"v":5}]\'></azzar-spark-chart>',
    tag: 'azzar-spark-chart',
  },
  {
    attributes: {
      data: {
        description: 'JSON array of {"color": palette name, "tooltip"?}.',
        required: true,
        type: 'json',
      },
    },
    category: 'chart',
    children: 'none',
    description: 'Row of status blocks, e.g. daily uptime.',
    example: '<azzar-tracker data=\'[{"color":"green","tooltip":"Oct 1"}]\'></azzar-tracker>',
    tag: 'azzar-tracker',
  },
  {
    attributes: {
      data: {
        description: 'JSON array of {"date":"YYYY-MM-DD","count"}.',
        required: true,
        type: 'json',
      },
    },
    category: 'chart',
    children: 'none',
    description: 'Calendar heatmap of daily activity.',
    example: '<azzar-heatmap data=\'[{"date":"2026-10-01","count":4}]\'></azzar-heatmap>',
    tag: 'azzar-heatmap',
  },
  {
    attributes: {
      data: {
        description: 'JSON array of {"name","value"} in funnel order.',
        required: true,
        type: 'json',
      },
    },
    category: 'chart',
    children: 'none',
    description: 'Funnel chart for conversion between stages.',
    example:
      '<azzar-funnel-chart data=\'[{"name":"Visit","value":1000},{"name":"Sign up","value":120}]\'></azzar-funnel-chart>',
    tag: 'azzar-funnel-chart',
  },
];

export const CANVAS_COMPONENT_MAP: ReadonlyMap<string, CanvasComponentSpec> = new Map(
  CANVAS_COMPONENTS.map((spec) => [spec.tag, spec]),
);

export const CANVAS_GLOBAL_ATTRIBUTES = new Set([
  'class',
  'hidden',
  'id',
  'role',
  'slot',
  'style',
  'title',
]);

export const isCanvasGlobalAttribute = (name: string): boolean =>
  CANVAS_GLOBAL_ATTRIBUTES.has(name) || name.startsWith('data-') || name.startsWith('aria-');
