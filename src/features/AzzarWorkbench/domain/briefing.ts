import type { Bi } from '../catalog';
import { getDepartmentTemplate } from '../catalog';
import type {
  Approval,
  Blocker,
  Mission,
  ReportedAction,
  WorkbenchData,
  WorkbenchMode,
} from './types';

export interface BriefingSection {
  /** Mission that finished since the user last looked. */
  completed: Mission[];
  /** Null for the personal section or standalone work. */
  departmentId: string | null;
  needsDecision: Array<{ approval?: Approval; blocker?: Blocker; mission: Mission }>;
  reported: Array<{ action: ReportedAction; mission: Mission }>;
  running: Mission[];
  title: Bi;
}

export interface Briefing {
  generatedAt: string;
  /** Count of items that need a person. */
  needsDecisionCount: number;
  sections: BriefingSection[];
}

const section = (title: Bi, departmentId: string | null, missions: Mission[]): BriefingSection => ({
  completed: missions.filter((m) => m.status === 'completed'),
  departmentId,
  needsDecision: missions.flatMap((m) => [
    ...m.approvals
      .filter((a) => a.status === 'pending')
      .map((approval) => ({ approval, mission: m })),
    ...m.blockers.filter((b) => b.needsDecision).map((blocker) => ({ blocker, mission: m })),
  ]),
  reported: missions.flatMap((m) => m.reported.map((action) => ({ action, mission: m }))),
  running: missions.filter((m) => m.status === 'running' || m.status === 'waiting_approval'),
  title,
});

const isEmpty = (s: BriefingSection) =>
  s.completed.length + s.needsDecision.length + s.reported.length + s.running.length === 0;

/**
 * One company briefing with a section per department (decision Q1). Individual mode has one
 * personal section. Sections with nothing in them are left out.
 */
export const buildBriefing = (data: WorkbenchData, mode: WorkbenchMode, now: string): Briefing => {
  const sections: BriefingSection[] = [];
  const missions = data.missions.filter((m) => m.status !== 'cancelled');

  if (mode === 'individual') {
    sections.push(section({ ar: 'ملخصك الشخصي', en: 'Your briefing' }, null, missions));
  } else {
    for (const d of Object.values(data.departments).filter((x) => x.active)) {
      const t = getDepartmentTemplate(d.templateId);
      sections.push(
        section(
          d.customName ?? t?.name ?? { ar: d.templateId, en: d.templateId },
          d.templateId,
          missions.filter((m) => m.departmentId === d.templateId),
        ),
      );
    }
    sections.push(
      section(
        { ar: 'أعمال مستقلة', en: 'Standalone work' },
        null,
        missions.filter((m) => !m.departmentId),
      ),
    );
  }

  const kept = sections.filter((s) => !isEmpty(s));
  return {
    generatedAt: now,
    needsDecisionCount: kept.reduce((n, s) => n + s.needsDecision.length, 0),
    sections: kept,
  };
};

/** Missions finished after the user last opened the briefing: the "while you were away" list. */
export const completedSince = (data: WorkbenchData, since: string | null): Mission[] =>
  data.missions.filter(
    (m) => m.status === 'completed' && m.completedAt && (since === null || m.completedAt > since),
  );
