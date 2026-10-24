import type {
  ModelIcon as AzzarModelIcon,
  ModelTag as AzzarModelTag,
  ProviderCombine as AzzarProviderCombine,
  ProviderIcon as AzzarProviderIcon,
} from '@azzar/icons';
import { Skeleton } from '@azzar/ui';
import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

// The catalog-backed features of @azzar/icons statically import every brand
// icon (~3 MB). Mounting them through lazy() keeps that catalog in one shared
// chunk that loads after paint instead of inside each route's closure.
const LazyModelIcon = lazy(() => import('@azzar/icons/es/features/ModelIcon'));
const LazyModelTag = lazy(() => import('@azzar/icons/es/features/ModelTag'));
const LazyProviderIcon = lazy(() =>
  import('@/libs/providerIcon').then(({ ProviderIcon }) => ({ default: ProviderIcon })),
);
const LazyProviderCombine = lazy(() =>
  import('@/libs/providerIcon').then(({ ProviderCombine }) => ({ default: ProviderCombine })),
);

const DEFAULT_SIZE = 24;

export const ModelIcon = (props: ComponentProps<typeof AzzarModelIcon>) => {
  const size = props.size ?? DEFAULT_SIZE;
  return (
    <Suspense fallback={<Skeleton height={size} width={size} />}>
      <LazyModelIcon {...props} />
    </Suspense>
  );
};

export const ProviderIcon = (props: ComponentProps<typeof AzzarProviderIcon>) => {
  const size = props.size ?? DEFAULT_SIZE;
  return (
    <Suspense fallback={<Skeleton height={size} width={size} />}>
      <LazyProviderIcon {...props} />
    </Suspense>
  );
};

export const ModelTag = (props: ComponentProps<typeof AzzarModelTag>) => (
  <Suspense fallback={<Skeleton height={22} width={96} />}>
    <LazyModelTag {...props} />
  </Suspense>
);

export const ProviderCombine = (props: ComponentProps<typeof AzzarProviderCombine>) => {
  const size = props.size ?? DEFAULT_SIZE;
  return (
    <Suspense fallback={<Skeleton height={size} width={size * 4} />}>
      <LazyProviderCombine {...props} />
    </Suspense>
  );
};
