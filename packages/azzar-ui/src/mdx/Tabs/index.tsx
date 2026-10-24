'use client';

import './style.css';

import clsx from 'clsx';
import { type FC, type ReactNode, useState } from 'react';

import { Flexbox, type FlexboxProps } from '../../Flex';
import AzzarTabs, { type TabsProps as AzzarTabsProps } from '../../Tabs';

import { mdxTabsClasses } from './stable';

export interface TabsProps extends Omit<FlexboxProps, 'children'> {
  children: ReactNode[];
  defaultIndex?: number | string;
  items: string[];
  tabNavProps?: Partial<AzzarTabsProps>;
}

const Tabs: FC<TabsProps> = ({
  defaultIndex = '0',
  items,
  children,
  className,
  tabNavProps = {},
  ...rest
}) => {
  const { className: tabNavClassName, onChange, ...tabNavRest } = tabNavProps;
  const [activeIndex, setActiveIndex] = useState<string>(String(defaultIndex));

  const index = Number(activeIndex);

  return (
    <Flexbox className={clsx(mdxTabsClasses(), className)} {...rest}>
      <AzzarTabs
        activeKey={activeIndex}
        className={clsx(mdxTabsClasses('nav'), tabNavClassName)}
        variant={'square'}
        classNames={{
          indicator: mdxTabsClasses('indicator'),
          list: mdxTabsClasses('list'),
          tab: clsx(mdxTabsClasses('tab'), 'azzar-mdx-tabs-tab'),
        }}
        items={items.map((item, i) => ({
          key: String(i),
          label: item,
        }))}
        onChange={(v) => {
          setActiveIndex(v);
          onChange?.(v);
        }}
        {...tabNavRest}
      />
      {children?.[index] || ''}
    </Flexbox>
  );
};

export default Tabs;
