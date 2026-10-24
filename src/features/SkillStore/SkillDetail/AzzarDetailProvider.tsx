'use client';

import { getAzzarSkillProviderById } from '@azzar/const';
import { type ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolStore } from '@/store/tool';
import { azzarSkillStoreSelectors } from '@/store/tool/selectors';
import { AzzarSkillStatus } from '@/store/tool/slices/azzarSkillStore/types';

import { type DetailContextValue } from './DetailContext';
import { DetailContext } from './DetailContext';

interface AzzarDetailProviderProps {
  children: ReactNode;
  identifier: string;
}

export const AzzarDetailProvider = ({ children, identifier }: AzzarDetailProviderProps) => {
  const { t } = useTranslation(['setting']);

  const config = useMemo(() => getAzzarSkillProviderById(identifier), [identifier]);

  const azzarSkillServers = useToolStore(azzarSkillStoreSelectors.getServers);

  const serverState = useMemo(
    () => azzarSkillServers.find((s) => s.identifier === identifier),
    [identifier, azzarSkillServers],
  );

  const isConnected = useMemo(
    () => serverState?.status === AzzarSkillStatus.CONNECTED,
    [serverState],
  );

  const useFetchProviderTools = useToolStore((s) => s.useFetchProviderTools);
  const providerTools = useToolStore((s) => s.azzarSkillToolsMap[identifier]);
  const { isHydrated, isValidating } = useFetchProviderTools(identifier);

  // The tool catalog is read from the store (the replica view); the hook only
  // orchestrates the fetch. `isLoading` means "nothing to show yet" — a
  // revalidation with the tools already on screen must not blank them.
  const tools = providerTools ?? [];
  const toolsLoading = !providerTools && (isValidating || !isHydrated);

  if (!config) return null;

  const { author, authorUrl, description, icon, readme, label } = config;

  const localizedDescription = t(`tools.azzarSkill.providers.${identifier}.description`, {
    defaultValue: description,
  });
  const localizedReadme = t(`tools.azzarSkill.providers.${identifier}.readme`, {
    defaultValue: readme,
  });

  const value: DetailContextValue = {
    author,
    authorUrl,
    config,
    description,
    icon,
    identifier,
    isConnected,
    label,
    localizedDescription,
    localizedReadme,
    readme,
    tools,
    toolsLoading,
  };

  return <DetailContext value={value}>{children}</DetailContext>;
};
