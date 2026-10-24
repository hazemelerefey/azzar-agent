import {
  type NeutralColors,
  neutralColors,
  type PrimaryColors,
  primaryColors,
} from '../customTheme';
import {
  createAzzarToken,
  createAzzarTokenGroups,
  type CreateAzzarTokenParams,
} from './createAzzarToken';

type Appearance = CreateAzzarTokenParams['appearance'];

const resolve = (params: CreateAzzarTokenParams): Record<string, unknown> => {
  const token: Record<string, unknown> = createAzzarToken(params);

  return Object.fromEntries(
    Object.keys(token)
      .sort()
      .map((key) => [key, token[key]]),
  );
};

const diff = (base: Record<string, unknown>, next: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(next).filter(([key, value]) => base[key] !== value));

const appearances: Appearance[] = ['light', 'dark'];
const primaries = Object.keys(primaryColors) as PrimaryColors[];
const neutrals = Object.keys(neutralColors) as NeutralColors[];

const variants: CreateAzzarTokenParams[] = appearances.flatMap((appearance) => [
  { appearance },
  ...primaries.map((primaryColor) => ({ appearance, primaryColor })),
  ...neutrals.map((neutralColor) => ({ appearance, neutralColor })),
]);

const groupKeys = (params: CreateAzzarTokenParams) =>
  Object.fromEntries(
    Object.entries(createAzzarTokenGroups(params)).map(([name, group]) => [
      name,
      Object.keys(group).sort(),
    ]),
  );

describe.each(appearances)('azzar token (%s)', (appearance) => {
  const base = resolve({ appearance });

  it('default', () => {
    expect(base).toMatchSnapshot();
  });

  it.each(primaries)('primary %s', (primaryColor) => {
    expect(diff(base, resolve({ appearance, primaryColor }))).toMatchSnapshot();
  });

  it.each(neutrals)('neutral %s', (neutralColor) => {
    expect(diff(base, resolve({ appearance, neutralColor }))).toMatchSnapshot();
  });
});

describe('token groups', () => {
  const reference = groupKeys({ appearance: 'light' });

  it('have identical key sets across every variant', () => {
    for (const params of variants) expect(groupKeys(params)).toEqual(reference);
  });

  it('are disjoint and cover the whole token', () => {
    const all = Object.values(reference).flat();

    expect(new Set(all).size).toBe(all.length);
    expect(all.sort()).toEqual(Object.keys(createAzzarToken({ appearance: 'light' })).sort());
  });

  it('confine primary, neutral and appearance changes to their groups', () => {
    const groupOf = (key: string) => Object.keys(reference).find((g) => reference[g].includes(key));
    const light = resolve({ appearance: 'light' });

    for (const appearance of appearances) {
      const base = resolve({ appearance });
      for (const primaryColor of primaries)
        for (const key of Object.keys(diff(base, resolve({ appearance, primaryColor }))))
          expect([key, groupOf(key)]).toEqual([key, 'primary']);
      for (const neutralColor of neutrals)
        for (const key of Object.keys(diff(base, resolve({ appearance, neutralColor }))))
          expect([key, groupOf(key)]).toEqual([key, 'neutral']);
    }
    for (const key of Object.keys(diff(light, resolve({ appearance: 'dark' }))))
      expect([key, groupOf(key)]).not.toEqual([key, 'static']);
  });

  it('only holds string or finite number values', () => {
    for (const params of variants)
      for (const [key, value] of Object.entries(createAzzarToken(params)))
        expect([key, typeof value === 'string' || Number.isFinite(value)]).toEqual([key, true]);
  });
});
