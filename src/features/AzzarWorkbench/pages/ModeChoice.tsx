import { Button, Center, Flexbox, Icon, Segmented } from '@azzar/ui';
import { ArrowRight, Building2, CheckCircle2, Sparkles, User } from 'lucide-react';
import { type CSSProperties, type FC, useState } from 'react';

import { useWorkbench } from '../hooks/useWorkbench';
import { useAzzarT } from '../ui/i18n';
import { Header, Page } from '../ui/kit';

const styles = {
  badge: {
    alignItems: 'center',
    backgroundColor: 'var(--ant-color-fill-secondary)',
    border: '1px solid var(--ant-color-border-secondary, #23262d)',
    borderRadius: 999,
    color: 'var(--ant-color-primary)',
    display: 'inline-flex',
    fontSize: 11,
    fontWeight: 600,
    gap: 4,
    padding: '2px 8px',
  },
  card: {
    backdropFilter: 'blur(12px)',
    backgroundColor: 'var(--ant-color-bg-container)',
    border: '1px solid var(--ant-color-border-secondary, #23262d)',
    borderRadius: 12,
    cursor: 'pointer',
    padding: 24,
    position: 'relative' as const,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cardSelected: {
    backgroundColor: 'var(--ant-color-bg-elevated)',
    borderColor: 'var(--ant-color-primary)',
    boxShadow: '0 0 0 1px var(--ant-color-primary)',
  },
  container: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    marginBlockStart: 16,
  },
  desc: {
    color: 'var(--ant-color-text-secondary)',
    fontSize: 13,
    lineHeight: 1.6,
    margin: 0,
  },
  iconWrap: {
    backgroundColor: 'var(--ant-color-fill-secondary)',
    border: '1px solid var(--ant-color-border-secondary, #23262d)',
    borderRadius: 10,
    color: 'var(--ant-color-primary)',
    height: 44,
    width: 44,
  },
  title: {
    color: 'var(--ant-color-text)',
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
  },
} satisfies Record<string, CSSProperties>;

/**
 * Professional mode switcher: Company vs Individual.
 * Built using native @azzar/ui primitives, semantic theme tokens, and Lucide icons.
 */
const ModeChoice: FC = () => {
  const { t } = useAzzarT();
  const setMode = useWorkbench((s) => s.setMode);
  const [selected, setSelected] = useState<'company' | 'individual'>('company');

  return (
    <Page maxWidth={820}>
      <Flexbox gap={24}>
        <Flexbox gap={12}>
          <Header subtitle={t('modeSubtitle')} title={t('modeTitle')} />

          <Flexbox horizontal align="center" gap={8}>
            <Segmented
              value={selected}
              options={[
                {
                  icon: <Icon icon={Building2} />,
                  label: t('modeCompany'),
                  value: 'company',
                },
                {
                  icon: <Icon icon={User} />,
                  label: t('modeIndividual'),
                  value: 'individual',
                },
              ]}
              onChange={(val) => {
                const modeVal = val as 'company' | 'individual';
                setSelected(modeVal);
              }}
            />
          </Flexbox>
        </Flexbox>

        <div style={styles.container}>
          {/* Company Card */}
          <div
            style={{
              ...styles.card,
              ...(selected === 'company' ? styles.cardSelected : {}),
            }}
            onClick={() => setSelected('company')}
          >
            <Flexbox gap={16}>
              <Flexbox horizontal align="center" justify="space-between">
                <Center style={styles.iconWrap}>
                  <Icon icon={Building2} size={22} />
                </Center>
                <span style={styles.badge}>
                  <Sparkles size={11} />
                  Enterprise
                </span>
              </Flexbox>

              <Flexbox gap={6}>
                <h2 style={styles.title}>{t('modeCompany')}</h2>
                <p style={styles.desc}>{t('modeCompanyDesc')}</p>
              </Flexbox>

              <Flexbox horizontal align="center" justify="space-between" style={{ marginTop: 8 }}>
                <Flexbox
                  horizontal
                  align="center"
                  gap={6}
                  style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }}
                >
                  <CheckCircle2 size={14} style={{ color: 'var(--ant-color-primary)' }} />
                  Full organization hierarchy
                </Flexbox>
                <Button
                  icon={<Icon icon={ArrowRight} />}
                  type={selected === 'company' ? 'primary' : 'default'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode('company');
                  }}
                >
                  {t('modeCompany')}
                </Button>
              </Flexbox>
            </Flexbox>
          </div>

          {/* Individual Card */}
          <div
            style={{
              ...styles.card,
              ...(selected === 'individual' ? styles.cardSelected : {}),
            }}
            onClick={() => setSelected('individual')}
          >
            <Flexbox gap={16}>
              <Flexbox horizontal align="center" justify="space-between">
                <Center style={styles.iconWrap}>
                  <Icon icon={User} size={22} />
                </Center>
                <span style={styles.badge}>
                  <Sparkles size={11} />
                  Personal
                </span>
              </Flexbox>

              <Flexbox gap={6}>
                <h2 style={styles.title}>{t('modeIndividual')}</h2>
                <p style={styles.desc}>{t('modeIndividualDesc')}</p>
              </Flexbox>

              <Flexbox horizontal align="center" justify="space-between" style={{ marginTop: 8 }}>
                <Flexbox
                  horizontal
                  align="center"
                  gap={6}
                  style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }}
                >
                  <CheckCircle2 size={14} style={{ color: 'var(--ant-color-primary)' }} />
                  Personal agent workspace
                </Flexbox>
                <Button
                  icon={<Icon icon={ArrowRight} />}
                  type={selected === 'individual' ? 'primary' : 'default'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode('individual');
                  }}
                >
                  {t('modeIndividual')}
                </Button>
              </Flexbox>
            </Flexbox>
          </div>
        </div>
      </Flexbox>
    </Page>
  );
};

export default ModeChoice;
