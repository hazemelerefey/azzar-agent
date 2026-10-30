import { DEFAULT_DISCOVER_ASSISTANT_ITEM } from '@azzar/const';
import { type CategoryItem, type CategoryListQuery } from '@azzar/market-sdk';
import {
  type AssistantListResponse,
  type AssistantMarketSource,
  type AssistantQueryParams,
  type DiscoverAssistantDetail,
  type DiscoverAssistantItem,
  type IdentifiersResponse,
} from '@azzar/types';
import { AssistantSorts } from '@azzar/types';
import dayjs from 'dayjs';
import { cloneDeep, countBy, merge } from 'es-toolkit/compat';

import { normalizeLocale } from '@/locales/resources';

import type { DiscoverService } from './index';
import { log } from './utils';
import { getWorkbenchAssistantDetail, getWorkbenchAssistantItems } from './workbenchAssistants';

export const isLegacySource = (source?: AssistantMarketSource) => source === 'legacy';

export const legacyGetAssistantListRaw = async (
  service: DiscoverService,
  locale?: string,
): Promise<DiscoverAssistantItem[]> => {
  log('legacyGetAssistantListRaw: locale=%s', locale);
  const normalizedLocale = normalizeLocale(locale);
  const workbenchAgents = getWorkbenchAssistantItems(normalizedLocale);
  const list = await service.assistantStore.getAgentIndex(normalizedLocale);
  if (!list || !Array.isArray(list)) {
    log(
      'legacyGetAssistantListRaw: no remote list found, returning %d workbench agents',
      workbenchAgents.length,
    );
    return workbenchAgents;
  }
  const result = list.map(({ meta, ...item }) => ({ ...item, ...meta }));
  // Prepend our official Azzar Workbench managers at the top of the community catalog!
  const combined = [...workbenchAgents, ...result];
  log(
    'legacyGetAssistantListRaw: returning %d items (%d workbench)',
    combined.length,
    workbenchAgents.length,
  );
  return combined;
};

export const legacyGetAssistantCategories = async (
  service: DiscoverService,
  params: CategoryListQuery = {},
): Promise<CategoryItem[]> => {
  log('legacyGetAssistantCategories: params=%O', params);
  const { q, locale } = params;
  let list = await legacyGetAssistantListRaw(service, locale);
  if (q) {
    const originalCount = list.length;
    list = list.filter((item) => {
      return [item.author, item.title, item.description, item?.tags]
        .flat()
        .filter(Boolean)
        .join(',')
        .toLowerCase()
        .includes(decodeURIComponent(q).toLowerCase());
    });
    log(
      'legacyGetAssistantCategories: filtered by query "%s", %d -> %d items',
      q,
      originalCount,
      list.length,
    );
  }
  const categoryCounts = countBy(list, (item) => item.category);
  const result = Object.entries(categoryCounts)
    .filter(([category]) => Boolean(category))
    .map(([category, count]) => ({
      category,
      count,
    }));
  log('legacyGetAssistantCategories: returning %d categories', result.length);
  return result;
};

export const legacyGetAssistantDetail = async (
  service: DiscoverService,
  params: {
    identifier: string;
    locale?: string;
    version?: string;
  },
): Promise<DiscoverAssistantDetail | undefined> => {
  log('legacyGetAssistantDetail: params=%O', params);
  const { locale, identifier } = params;
  const workbenchDetail = getWorkbenchAssistantDetail(identifier, locale);
  if (workbenchDetail) {
    log('legacyGetAssistantDetail: returning workbench agent detail for %s', identifier);
    return workbenchDetail;
  }
  const normalizedLocale = normalizeLocale(locale);
  const data = await service.assistantStore.getAgent(identifier, normalizedLocale);
  if (!data) {
    log('legacyGetAssistantDetail: assistant not found for identifier=%s', identifier);
    return;
  }
  const { meta, ...item } = data;
  const assistant = merge(cloneDeep(DEFAULT_DISCOVER_ASSISTANT_ITEM), { ...item, ...meta });
  const list = await service.getAssistantList({
    category: assistant.category,
    includeAgentGroup: true,
    locale,
    page: 1,
    pageSize: 7,
    source: 'legacy',
  });
  const result = {
    ...assistant,
    related: list.items.filter((item) => item.identifier !== assistant.identifier).slice(0, 6),
  };
  log('legacyGetAssistantDetail: returning assistant with %d related items', result.related.length);
  return result;
};

export const legacyGetAssistantIdentifiers = async (
  service: DiscoverService,
): Promise<IdentifiersResponse> => {
  log('legacyGetAssistantIdentifiers: fetching identifiers');
  const list = await legacyGetAssistantListRaw(service);
  const result = list.map((item) => {
    return {
      identifier: item.identifier,
      lastModified: item.createdAt,
    };
  });
  log('legacyGetAssistantIdentifiers: returning %d identifiers', result.length);
  return result;
};

export const legacyGetAssistantList = async (
  service: DiscoverService,
  params: AssistantQueryParams = {},
): Promise<AssistantListResponse> => {
  log('legacyGetAssistantList: params=%O', params);
  const {
    locale,
    category,
    order = 'desc',
    page = 1,
    pageSize = 20,
    q,
    sort = AssistantSorts.Recommended,
    ownerId,
  } = params;
  const currentPage = Number(page) || 1;
  const currentPageSize = Number(pageSize) || 20;

  if (ownerId) {
    log('legacyGetAssistantList: ownerId filter not supported in legacy source');
    return {
      currentPage,
      items: [],
      pageSize: currentPageSize,
      totalCount: 0,
      totalPages: 0,
    };
  }

  let list = await legacyGetAssistantListRaw(service, locale);
  const originalCount = list.length;

  if (category) {
    list = list.filter((item) => item.category === category);
    log(
      'legacyGetAssistantList: filtered by category "%s", %d -> %d items',
      category,
      originalCount,
      list.length,
    );
  }

  if (q) {
    const beforeFilter = list.length;
    list = list.filter((item) => {
      return [item.author, item.title, item.description, item?.tags]
        .flat()
        .filter(Boolean)
        .join(',')
        .toLowerCase()
        .includes(decodeURIComponent(q).toLowerCase());
    });
    log(
      'legacyGetAssistantList: filtered by query "%s", %d -> %d items',
      q,
      beforeFilter,
      list.length,
    );
  }

  if (sort) {
    log('legacyGetAssistantList: sorting by %s %s', sort, order);
    switch (sort) {
      case AssistantSorts.UpdatedAt: {
        // Legacy source doesn't have updatedAt, fallback to createdAt
        list = list.sort((a, b) => {
          if (order === 'asc') {
            return dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix();
          } else {
            return dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix();
          }
        });
        break;
      }
      default: {
        // Legacy source doesn't support these sorts (MostUsage, HaveSkills, Recommended), keep original order
        break;
      }
    }
  }

  const start = (currentPage - 1) * currentPageSize;
  const end = currentPage * currentPageSize;
  const result = {
    currentPage,
    items: list.slice(start, end),
    pageSize: currentPageSize,
    totalCount: list.length,
    totalPages: Math.ceil(list.length / currentPageSize),
  };
  log(
    'legacyGetAssistantList: returning page %d/%d with %d items',
    currentPage,
    result.totalPages,
    result.items.length,
  );
  return result;
};
