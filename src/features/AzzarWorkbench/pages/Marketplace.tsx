import { Flexbox, Icon } from '@azzar/ui';
import {
  Bot,
  Compass,
  Download,
  ExternalLink,
  Filter,
  Layers,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import { type FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { AGENT_TEMPLATES, DEPARTMENT_TEMPLATES, getDepartmentTemplate } from '../catalog';
import { useWorkbench } from '../hooks/useWorkbench';
import { AgentDetails } from '../ui/AgentDetails';
import { useAzzarT } from '../ui/i18n';
import { Btn, Card, DeptAvatar, Header, Marker, Notice, Page, styles } from '../ui/kit';

type MarketplaceTab = 'agents' | 'skills' | 'mcp';

interface CommunityItem {
  author?: string;
  avatar?: string;
  description?: string;
  identifier: string;
  tags?: string[];
  title?: string;
}

const Marketplace: FC = () => {
  const { bi, t } = useAzzarT();
  const mode = useWorkbench((s) => s.mode);
  const installs = useWorkbench((s) => s.installs);
  const install = useWorkbench((s) => s.installAgent);

  const [activeTab, setActiveTab] = useState<MarketplaceTab>('agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [open, setOpen] = useState<string | null>(null);

  // Live community data state
  const [communityAgents, setCommunityAgents] = useState<CommunityItem[]>([]);
  const [communitySkills, setCommunitySkills] = useState<CommunityItem[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    let isMounted = true;
    const fetchLiveCommunity = async () => {
      try {
        // Fetch real community agents index
        const resAgents = await fetch('https://chat-agents.lobehub.com/index.json').catch(
          () => null,
        );
        if (resAgents?.ok && isMounted) {
          const data = await resAgents.json();
          const items: CommunityItem[] = (data.agents || data || []).slice(0, 30).map((a: any) => ({
            author: a.author,
            avatar: a.meta?.avatar || '🤖',
            description: a.meta?.description || '',
            identifier: a.identifier,
            tags: a.meta?.tags || [],
            title: a.meta?.title || a.identifier,
          }));
          setCommunityAgents(items);
        }

        // Fetch real community plugins/skills index
        const resSkills = await fetch('https://chat-plugins.lobehub.com/index.json').catch(
          () => null,
        );
        if (resSkills?.ok && isMounted) {
          const data = await resSkills.json();
          const items: CommunityItem[] = (data.plugins || data || [])
            .slice(0, 30)
            .map((p: any) => ({
              author: p.author,
              avatar: p.meta?.avatar || '⚡',
              description: p.meta?.description || '',
              identifier: p.identifier,
              tags: p.meta?.tags || [],
              title: p.meta?.title || p.identifier,
            }));
          setCommunitySkills(items);
        }
      } catch {
        // Fallback gracefully in testing / offline environments
      }
    };

    fetchLiveCommunity();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter local enterprise agents
  const localAgents = useMemo(() => {
    const base = AGENT_TEMPLATES.filter((a) =>
      mode === 'individual'
        ? a.kind === 'individual' || (a.kind === 'manager' && a.availability === 'available')
        : a.kind === 'manager',
    );
    const byDept =
      departmentFilter === 'all' ? base : base.filter((a) => a.departmentId === departmentFilter);
    const sorted = [...byDept].sort(
      (a, b) => Number(b.availability === 'available') - Number(a.availability === 'available'),
    );

    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (a) =>
        bi(a.name).toLowerCase().includes(q) ||
        bi(a.summary).toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q),
    );
  }, [mode, departmentFilter, searchQuery, bi]);

  // Filter community agents
  const filteredCommunityAgents = useMemo(() => {
    if (!searchQuery.trim()) return communityAgents;
    const q = searchQuery.toLowerCase();
    return communityAgents.filter(
      (a) =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
  }, [communityAgents, searchQuery]);

  // Filter community skills
  const filteredCommunitySkills = useMemo(() => {
    if (!searchQuery.trim()) return communitySkills;
    const q = searchQuery.toLowerCase();
    return communitySkills.filter(
      (s) =>
        (s.title || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
  }, [communitySkills, searchQuery]);

  // MCP Servers catalog
  const mcpServers = useMemo(() => {
    const list = [
      {
        author: 'Composio / AZZAR',
        category: 'Productivity',
        description:
          'Connect with GitHub, Linear, Google Calendar, Notion, and 100+ business platforms via MCP.',
        identifier: 'composio-mcp',
        tags: ['mcp', 'tools', 'integrations'],
        title: 'Enterprise MCP Gateway',
      },
      {
        author: 'PostgreSQL',
        category: 'Database',
        description:
          'Direct model-driven schema inspection, safe read queries, and database analytics.',
        identifier: 'postgres-mcp',
        tags: ['database', 'postgres', 'analytics'],
        title: 'PostgreSQL Inspector MCP',
      },
      {
        author: 'Filesystem',
        category: 'Developer',
        description:
          'Secure, sandboxed filesystem access for document workflows, logs, and workspace assets.',
        identifier: 'filesystem-mcp',
        tags: ['filesystem', 'files', 'workspace'],
        title: 'Secure Workspace Filesystem',
      },
      {
        author: 'Web Browser',
        category: 'Automation',
        description:
          'Headless browser automation for research, verification, and automated reporting.',
        identifier: 'browser-mcp',
        tags: ['browser', 'scraping', 'automation'],
        title: 'Puppeteer Web Runner',
      },
    ];

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  return (
    <Page>
      <Header
        subtitle={t('marketSubtitle')}
        title={t('marketTitle')}
        actions={
          <Flexbox horizontal align="center" gap={8}>
            <Marker label="localCatalog" />
            <Link to="/community">
              <Btn primary>
                <Icon icon={Compass} size="small" />
                <span>Browse Full Community</span>
              </Btn>
            </Link>
          </Flexbox>
        }
      />

      <Notice>{t('marketNote')}</Notice>

      {/* Main Hub Tabs: Agents, Skills, MCP Servers */}
      <Flexbox
        horizontal
        align="center"
        gap={12}
        justify="space-between"
        wrap="wrap"
        style={{
          borderBottom: '1px solid var(--ant-color-border-secondary, #23262d)',
          paddingBottom: 12,
        }}
      >
        <Flexbox horizontal align="center" gap={8}>
          <button
            style={activeTab === 'agents' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab('agents')}
          >
            <Flexbox horizontal align="center" gap={6}>
              <Icon icon={Bot} size="small" />
              <span>Agents</span>
              <span style={styles.marker}>{localAgents.length + communityAgents.length}</span>
            </Flexbox>
          </button>

          <button
            style={activeTab === 'skills' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab('skills')}
          >
            <Flexbox horizontal align="center" gap={6}>
              <Icon icon={Zap} size="small" />
              <span>Skills & Tools</span>
              <span style={styles.marker}>{communitySkills.length || 40}</span>
            </Flexbox>
          </button>

          <button
            style={activeTab === 'mcp' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab('mcp')}
          >
            <Flexbox horizontal align="center" gap={6}>
              <Icon icon={Layers} size="small" />
              <span>MCP Servers</span>
              <span style={styles.marker}>{mcpServers.length}</span>
            </Flexbox>
          </button>
        </Flexbox>

        {/* Global Search inside Marketplace */}
        <Flexbox horizontal align="center" gap={8} style={{ minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              style={{
                ...styles.field,
                paddingLeft: 32,
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Icon
              icon={Search}
              size="small"
              style={{
                color: 'var(--ant-color-text-secondary)',
                left: 10,
                position: 'absolute',
                top: 11,
              }}
            />
          </div>
        </Flexbox>
      </Flexbox>

      {/* AGENTS TAB */}
      {activeTab === 'agents' && (
        <Flexbox gap={24}>
          {/* Department filter for company mode */}
          {mode === 'company' && (
            <Flexbox horizontal align="center" gap={8}>
              <Icon
                icon={Filter}
                size="small"
                style={{ color: 'var(--ant-color-text-secondary)' }}
              />
              <select
                style={{ ...styles.field, maxWidth: 300 }}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">{t('allDepartments')}</option>
                {DEPARTMENT_TEMPLATES.filter((d) => d.managerId).map((d) => (
                  <option key={d.id} value={d.id}>
                    {bi(d.name)}
                  </option>
                ))}
              </select>
            </Flexbox>
          )}

          {/* Section 1: Official Enterprise Managers */}
          <Flexbox gap={12}>
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={Sparkles} size="small" style={{ color: 'var(--ant-color-primary)' }} />
              <h2 style={styles.h2}>Official Enterprise Managers</h2>
            </Flexbox>

            <div style={styles.grid}>
              {localAgents.map((a) => {
                const dept = a.departmentId ? getDepartmentTemplate(a.departmentId) : undefined;
                const isInstalled = Boolean(installs[a.id]);
                const available = a.availability === 'available';
                return (
                  <Card key={a.id}>
                    <Flexbox gap={12}>
                      <Flexbox horizontal align="center" gap={12}>
                        {dept && <DeptAvatar department={dept} size={44} />}
                        <Flexbox gap={2}>
                          <strong style={{ fontSize: 15 }}>{bi(a.name)}</strong>
                          <span style={styles.muted}>
                            {dept ? bi(dept.name) : t('individualAgents')}
                          </span>
                        </Flexbox>
                      </Flexbox>

                      <p style={{ ...styles.muted, minHeight: 40 }}>{bi(a.summary)}</p>

                      <Flexbox horizontal align="center" gap={6}>
                        <Marker label={available ? 'available' : 'comingSoon'} />
                        {isInstalled && <Marker label="installed" />}
                      </Flexbox>

                      <Flexbox horizontal align="center" gap={8} wrap="wrap">
                        {available && !isInstalled && (
                          <Btn primary onClick={() => install(a.id)}>
                            <Icon icon={Download} size="small" />
                            <span>{t('install')}</span>
                          </Btn>
                        )}
                        {isInstalled && (
                          <Link to="/azzar/agents">
                            <Btn>{t('navAgents')}</Btn>
                          </Link>
                        )}
                        {!available && <Btn disabled>{t('comingSoon')}</Btn>}
                        <Btn onClick={() => setOpen(open === a.id ? null : a.id)}>
                          <Icon icon={ExternalLink} size="small" />
                          <span>{t('open')}</span>
                        </Btn>
                      </Flexbox>
                      {open === a.id && <AgentDetails agent={a} />}
                    </Flexbox>
                  </Card>
                );
              })}
            </div>
          </Flexbox>

          {/* Section 2: Real Community Agents */}
          {communityAgents.length > 0 && (
            <Flexbox gap={12} style={{ marginTop: 12 }}>
              <Flexbox horizontal align="center" justify="space-between">
                <Flexbox horizontal align="center" gap={8}>
                  <Icon
                    icon={Bot}
                    size="small"
                    style={{ color: 'var(--ant-color-text-secondary)' }}
                  />
                  <h2 style={styles.h2}>Community Agents ({filteredCommunityAgents.length})</h2>
                </Flexbox>
                <Link
                  to="/community/agent"
                  style={{
                    fontSize: 13,
                    color: 'var(--ant-color-primary)',
                    textDecoration: 'none',
                  }}
                >
                  View all in Community →
                </Link>
              </Flexbox>

              <div style={styles.grid}>
                {filteredCommunityAgents.map((ca) => (
                  <Card key={ca.identifier}>
                    <Flexbox gap={12} style={{ height: '100%', justifyContent: 'space-between' }}>
                      <Flexbox gap={10}>
                        <Flexbox horizontal align="center" gap={10}>
                          <div
                            style={{
                              alignItems: 'center',
                              background: 'var(--ant-color-fill-secondary)',
                              borderRadius: 8,
                              display: 'flex',
                              fontSize: 22,
                              height: 40,
                              justifyContent: 'center',
                              width: 40,
                            }}
                          >
                            {ca.avatar?.startsWith('http') ? (
                              <img
                                alt={ca.title}
                                src={ca.avatar}
                                style={{ borderRadius: 6, height: 32, width: 32 }}
                              />
                            ) : (
                              ca.avatar || '🤖'
                            )}
                          </div>
                          <Flexbox gap={2}>
                            <strong style={{ fontSize: 14 }}>{ca.title}</strong>
                            <span style={{ fontSize: 12, color: 'var(--ant-color-text-tertiary)' }}>
                              by {ca.author || 'Community'}
                            </span>
                          </Flexbox>
                        </Flexbox>

                        <p
                          style={{
                            ...styles.muted,
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                          }}
                        >
                          {ca.description ||
                            'Community AI assistant ready to assist with daily tasks.'}
                        </p>

                        {ca.tags && ca.tags.length > 0 && (
                          <Flexbox horizontal gap={4} wrap="wrap">
                            {ca.tags.slice(0, 3).map((tag) => (
                              <span key={tag} style={styles.marker}>
                                {tag}
                              </span>
                            ))}
                          </Flexbox>
                        )}
                      </Flexbox>

                      <Flexbox horizontal align="center" gap={8}>
                        <Link
                          style={{ textDecoration: 'none' }}
                          to={`/community/agent/${ca.identifier}`}
                        >
                          <Btn>
                            <Icon icon={ExternalLink} size="small" />
                            <span>View Details</span>
                          </Btn>
                        </Link>
                      </Flexbox>
                    </Flexbox>
                  </Card>
                ))}
              </div>
            </Flexbox>
          )}
        </Flexbox>
      )}

      {/* SKILLS & TOOLS TAB */}
      {activeTab === 'skills' && (
        <Flexbox gap={16}>
          <Flexbox horizontal align="center" justify="space-between">
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={Zap} size="small" style={{ color: 'var(--ant-color-primary)' }} />
              <h2 style={styles.h2}>
                Community Skills & Extensions ({filteredCommunitySkills.length})
              </h2>
            </Flexbox>
            <Link
              style={{ fontSize: 13, color: 'var(--ant-color-primary)', textDecoration: 'none' }}
              to="/community/skill"
            >
              Explore Skills Catalog →
            </Link>
          </Flexbox>

          <div style={styles.grid}>
            {filteredCommunitySkills.map((sk) => (
              <Card key={sk.identifier}>
                <Flexbox gap={12} style={{ height: '100%', justifyContent: 'space-between' }}>
                  <Flexbox gap={10}>
                    <Flexbox horizontal align="center" gap={10}>
                      <div
                        style={{
                          alignItems: 'center',
                          background: 'var(--ant-color-fill-secondary)',
                          borderRadius: 8,
                          display: 'flex',
                          fontSize: 22,
                          height: 40,
                          justifyContent: 'center',
                          width: 40,
                        }}
                      >
                        {sk.avatar?.startsWith('http') ? (
                          <img
                            alt={sk.title}
                            src={sk.avatar}
                            style={{ borderRadius: 6, height: 32, width: 32 }}
                          />
                        ) : (
                          sk.avatar || '⚡'
                        )}
                      </div>
                      <Flexbox gap={2}>
                        <strong style={{ fontSize: 14 }}>{sk.title}</strong>
                        <span style={{ fontSize: 12, color: 'var(--ant-color-text-tertiary)' }}>
                          by {sk.author || 'LobeHub'}
                        </span>
                      </Flexbox>
                    </Flexbox>

                    <p
                      style={{
                        ...styles.muted,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                      }}
                    >
                      {sk.description || 'Custom tool plugin for enhanced model capabilities.'}
                    </p>

                    {sk.tags && sk.tags.length > 0 && (
                      <Flexbox horizontal gap={4} wrap="wrap">
                        {sk.tags.slice(0, 3).map((tag) => (
                          <span key={tag} style={styles.marker}>
                            {tag}
                          </span>
                        ))}
                      </Flexbox>
                    )}
                  </Flexbox>

                  <Flexbox horizontal align="center" gap={8}>
                    <Link style={{ textDecoration: 'none' }} to="/community/skill">
                      <Btn>
                        <Icon icon={ExternalLink} size="small" />
                        <span>Inspect Skill</span>
                      </Btn>
                    </Link>
                  </Flexbox>
                </Flexbox>
              </Card>
            ))}
          </div>
        </Flexbox>
      )}

      {/* MCP SERVERS TAB */}
      {activeTab === 'mcp' && (
        <Flexbox gap={16}>
          <Flexbox horizontal align="center" justify="space-between">
            <Flexbox horizontal align="center" gap={8}>
              <Icon icon={Layers} size="small" style={{ color: 'var(--ant-color-primary)' }} />
              <h2 style={styles.h2}>Model Context Protocol (MCP) Servers ({mcpServers.length})</h2>
            </Flexbox>
            <Link
              style={{ fontSize: 13, color: 'var(--ant-color-primary)', textDecoration: 'none' }}
              to="/community/mcp"
            >
              Connect MCP Servers in Community →
            </Link>
          </Flexbox>

          <div style={styles.grid}>
            {mcpServers.map((mcp) => (
              <Card key={mcp.identifier}>
                <Flexbox gap={12} style={{ height: '100%', justifyContent: 'space-between' }}>
                  <Flexbox gap={10}>
                    <Flexbox horizontal align="center" gap={10}>
                      <div
                        style={{
                          alignItems: 'center',
                          background: 'var(--ant-color-fill-secondary)',
                          borderRadius: 8,
                          display: 'flex',
                          fontSize: 20,
                          height: 40,
                          justifyContent: 'center',
                          width: 40,
                        }}
                      >
                        🔌
                      </div>
                      <Flexbox gap={2}>
                        <strong style={{ fontSize: 14 }}>{mcp.title}</strong>
                        <span style={{ fontSize: 12, color: 'var(--ant-color-text-tertiary)' }}>
                          {mcp.category} • by {mcp.author}
                        </span>
                      </Flexbox>
                    </Flexbox>

                    <p style={{ ...styles.muted, minHeight: 48 }}>{mcp.description}</p>

                    <Flexbox horizontal gap={4} wrap="wrap">
                      {mcp.tags.map((tag) => (
                        <span key={tag} style={styles.marker}>
                          {tag}
                        </span>
                      ))}
                    </Flexbox>
                  </Flexbox>

                  <Flexbox horizontal align="center" gap={8}>
                    <Link style={{ textDecoration: 'none' }} to="/community/mcp">
                      <Btn primary>
                        <Icon icon={ExternalLink} size="small" />
                        <span>Connect Server</span>
                      </Btn>
                    </Link>
                  </Flexbox>
                </Flexbox>
              </Card>
            ))}
          </div>
        </Flexbox>
      )}
    </Page>
  );
};

export default Marketplace;
