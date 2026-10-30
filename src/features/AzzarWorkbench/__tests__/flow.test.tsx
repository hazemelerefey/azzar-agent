import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWorkbench, workbenchStore } from '../hooks/useWorkbench';
import Home from '../pages/MissionsHome';
import ModeChoice from '../pages/ModeChoice';
import { AzzarWorkbenchRoutes } from '../routes';

vi.mock('@/hooks/useIsDark', () => ({ useIsDark: () => false }));

vi.mock('@azzar/ui', () => ({
  Button: ({ children, onClick, type, icon, disabled, ...props }: any) => (
    <button
      disabled={disabled}
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onClick}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
  Center: ({ children, className, style, ...props }: any) => (
    <div
      className={className}
      style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', ...style }}
      {...props}
    >
      {children}
    </div>
  ),
  createStaticStyles: (fn: any) => {
    const dummyCss = () => '';
    const dummyCssVar = new Proxy({}, { get: () => '' });
    return fn({ css: dummyCss, cssVar: dummyCssVar });
  },
  cssVar: (name: string) => `var(--ant-${name})`,
  Flexbox: ({
    children,
    horizontal,
    align,
    justify,
    gap,
    wrap,
    style,
    className,
    ...props
  }: any) => (
    <div
      className={className}
      style={{
        alignItems: align,
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        flexWrap: wrap ? 'wrap' : undefined,
        gap,
        justifyContent: justify,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
  Icon: ({ icon: IconComponent, size, ...props }: any) =>
    IconComponent ? <IconComponent size={size} {...props} /> : null,
  Segmented: ({ options, value, onChange }: any) => (
    <div role="radiogroup">
      {options?.map((opt: any) => (
        <button
          aria-checked={value === opt.value}
          key={opt.value}
          role="radio"
          onClick={() => onChange?.(opt.value)}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

const RootHome = () => {
  const mode = useWorkbench((s) => s.mode);
  return mode ? <Home /> : <ModeChoice />;
};

const mount = (path = '/') => {
  const router = createMemoryRouter(
    [{ element: <RootHome />, path: '/' }, ...AzzarWorkbenchRoutes],
    {
      initialEntries: [path],
    },
  );
  render(<RouterProvider router={router} />);
  return router;
};

beforeEach(() => {
  workbenchStore.getState().reset();
  localStorage.clear();
});

describe('workbench UI flow (English, happy-dom)', () => {
  it('shows the mode choice first, with no data', async () => {
    workbenchStore.setState({ mode: null });
    mount();
    expect(await screen.findByText('How will you use AZZAR?')).toBeTruthy();
  });

  it('Individual mode hides company pages and redirects them home', async () => {
    workbenchStore.getState().setMode('individual');
    const router = mount('/azzar/departments');
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(screen.queryByRole('link', { name: 'Departments' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'CAO tree' })).toBeNull();
  });

  it('Marketplace shows the Local catalog label, installs Marketing, blocks Coming soon agents', async () => {
    workbenchStore.getState().setMode('company');
    mount('/azzar/marketplace');
    expect(await screen.findByText('Local catalog')).toBeTruthy();
    const user = userEvent.setup();
    expect(screen.getAllByText('Coming soon').length).toBeGreaterThan(0);
    const installButtons = screen.getAllByRole('button', { name: 'Install' });
    expect(installButtons).toHaveLength(1); // only the Marketing Manager works
    await user.click(installButtons[0]);
    expect(Object.keys(workbenchStore.getState().installs)).toEqual(['marketing-manager']);
  });

  it('Departments page: Grouping label, activation, and only Marketing is Working', async () => {
    workbenchStore.getState().setMode('company');
    mount('/azzar/departments');
    expect(await screen.findByText('Grouping, not infrastructure')).toBeTruthy();
    expect(screen.getAllByText('Working')).toHaveLength(1);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Activate starter departments' }));
    expect(
      Object.values(workbenchStore.getState().departments).filter((d) => d.active),
    ).toHaveLength(5);
  });

  it('full Marketing flow: install, assign, project, mission, approval, report, briefing, CAO', async () => {
    const s = workbenchStore.getState();
    s.setMode('company');
    s.activateDepartment('marketing');
    s.installAgent('marketing-manager');
    const user = userEvent.setup();

    // My Agents: assign to the Marketing department through the UI.
    const router = mount('/azzar/agents');
    const selects = await screen.findAllByRole('combobox');
    await user.selectOptions(selects[0], 'marketing');
    expect(workbenchStore.getState().installs['marketing-manager'].departmentIds).toEqual([
      'marketing',
    ]);

    // Project inside Marketing.
    const p = workbenchStore
      .getState()
      .createProject({ departmentId: 'marketing', description: '', name: 'Q4 launch' });
    if (!p.ok) throw new Error('project');

    // Mission from Missions home.
    await router.navigate('/');
    await screen.findByText('New mission');
    await user.type(screen.getByLabelText('Goal'), 'Launch the Nile Pay app');
    await user.type(screen.getByLabelText('Deadline'), '2026-11-15');
    await user.type(screen.getByLabelText(/Success criteria/), 'Plan ready');
    await user.click(screen.getByRole('button', { name: 'Start mission' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/azzar\/missions\/msn_/));
    expect(screen.getAllByText('Simulated').length).toBeGreaterThan(0);

    // Run until the approval pause.
    await user.click(await screen.findByRole('button', { name: 'Run until it pauses' }));
    const card = (await screen.findByText('Approval request')).closest('div')!.parentElement!;
    expect(within(card).getByText(/real tap/i)).toBeTruthy();
    expect(workbenchStore.getState().missions[0].status).toBe('waiting_approval');

    // Tap approve, run to the end.
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await user.click(screen.getByRole('button', { name: 'Run until it pauses' }));
    expect(await screen.findByText('Completion report')).toBeTruthy();
    expect(workbenchStore.getState().missions[0].status).toBe('completed');

    // Briefing and CAO tree show the mission.
    await router.navigate('/azzar/briefing');
    expect((await screen.findAllByText(/Launch the Nile Pay app/)).length).toBeGreaterThan(0);
    await router.navigate('/azzar/cao');
    expect(await screen.findByText('Chief Agent Orchestrator tree')).toBeTruthy();
  });

  it('Rules console labels the model lock "UI only" and the department hub shows the isolation label', async () => {
    const s = workbenchStore.getState();
    s.setMode('company');
    s.activateDepartment('marketing');
    mount('/azzar/departments/marketing');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Rules' }));
    expect(screen.getAllByText('UI only').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Grouping, not infrastructure').length).toBeGreaterThan(0);
  });

  it('a template-only department shows no working claim', async () => {
    const s = workbenchStore.getState();
    s.setMode('company');
    s.activateDepartment('sales');
    mount('/azzar/departments/sales');
    expect(await screen.findByText(/template in this release/)).toBeTruthy();
    expect(screen.queryByText('Working')).toBeNull();
  });
});
