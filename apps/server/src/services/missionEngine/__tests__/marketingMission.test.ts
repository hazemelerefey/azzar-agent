import { describe, expect, it } from 'vitest';

import { MissionDAG } from '../dag';
import { evaluateGuardrail, MARKETING_MISSION_DAG } from '../marketingMission';

describe('Marketing Mission Specification & Guardrail Contracts', () => {
  it('defines the exact 7-node frozen DAG with N1 and N2 parallel', () => {
    const dag = new MissionDAG(MARKETING_MISSION_DAG);
    expect(dag.nodes.map((n) => n.id)).toEqual(['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7']);

    // N1 and N2 have no dependencies and are ready in parallel
    expect(dag.getReadyNodes({})).toEqual(['N1', 'N2']);

    // N3 depends on both N1 and N2
    expect(dag.getNode('N3')?.dependsOn).toEqual(['N1', 'N2']);
    expect(dag.getNode('N4')?.dependsOn).toEqual(['N3']);
    expect(dag.getNode('N5')?.dependsOn).toEqual(['N3', 'N4']);
    expect(dag.getNode('N6')?.dependsOn).toEqual(['N5']);
    expect(dag.getNode('N7')?.dependsOn).toEqual(['N6']);
  });

  it('passes deterministic guardrail when all 6 criteria are met', () => {
    const validDraft = {
      audience: 'أصحاب المشاريع الصغيرة في مصر',
      budgetSpend: 0,
      channels: ['Facebook', 'WhatsApp Business'],
      englishSummary: 'AZZAR launches Marketing Agent for Egyptian SMBs with human approval.',
      ideas: [
        { descriptionAr: 'خطة تسويق تكبر شغلك بسهولة', sourceRef: 'DESIGN.md', title: 'Idea 1' },
        {
          descriptionAr: 'بوستات فيسبوك باللهجة المصرية عشان عميلك',
          sourceRef: 'AGENTS.md',
          title: 'Idea 2',
        },
        {
          descriptionAr: 'تحكم كامل معاك في كل خطوة',
          sourceRef: 'https://hazemelerefy.tech',
          title: 'Idea 3',
        },
      ],
      messageAr: 'أذّار معاك عشان تكبر شغلك والبيزنس بتاعك دلوقتي بسهولة',
    };

    const validLeads = {
      rows: [
        { id: '1', label: 'SAMPLE', sample: true },
        { id: '2', label: 'SAMPLE', sample: true },
        { id: '3', label: 'SAMPLE', sample: true },
        { id: '4', label: 'SAMPLE', sample: true },
        { id: '5', label: 'SAMPLE', sample: true },
      ],
    };

    const res = evaluateGuardrail(validDraft, validLeads);
    expect(res.overallPass).toBe(true);
    expect(res.checks.requiredFieldsPresent.pass).toBe(true);
    expect(res.checks.sourcesCited.pass).toBe(true);
    expect(res.checks.sampleFlagPresent.pass).toBe(true);
    expect(res.checks.noInventedNumbers.pass).toBe(true);
    expect(res.checks.budgetNotExceeded.pass).toBe(true);
    expect(res.checks.arabicNaturalNotFormal.pass).toBe(true);
  });

  it('fails deterministic guardrail when source citation or sample flag is missing', () => {
    const draftMissingSource = {
      audience: 'أصحاب المشاريع الصغيرة في مصر',
      budgetSpend: 0,
      channels: ['Facebook', 'WhatsApp Business'],
      englishSummary: 'AZZAR launches Marketing Agent for Egyptian SMBs.',
      ideas: [
        { descriptionAr: 'خطة تسويق تكبر شغلك', sourceRef: '', title: 'Idea 1' },
        { descriptionAr: 'بوستات فيسبوك عشان عميلك', sourceRef: 'AGENTS.md', title: 'Idea 2' },
        { descriptionAr: 'تحكم كامل معاك', sourceRef: 'DESIGN.md', title: 'Idea 3' },
      ],
      messageAr: 'أذّار معاك عشان تكبر شغلك دلوقتي',
    };

    const leadsMissingSample = {
      rows: [
        { id: '1', label: 'REAL', sample: false },
        { id: '2', label: 'SAMPLE', sample: true },
      ],
    };

    const res = evaluateGuardrail(draftMissingSource, leadsMissingSample);
    expect(res.overallPass).toBe(false);
    expect(res.checks.sourcesCited.pass).toBe(false);
    expect(res.checks.sampleFlagPresent.pass).toBe(false);
  });
});
