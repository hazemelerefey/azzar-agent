'use client';

import { type FC } from 'react';

export interface MetaProps {
  description?: string;
  title?: string;
  withManifest?: boolean;
}

const Meta: FC<MetaProps> = ({
  title = 'AZZAR',
  description = 'Empowering your AI dreams with AZZAR',
  withManifest,
}) => {
  return (
    <>
      <link href="/favicon.ico" rel="shortcut icon" />
      <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
      <link href="/favicon.ico" rel="icon" sizes="32x32" type="image/x-icon" />
      <link href="/favicon.ico" rel="icon" sizes="16x16" type="image/x-icon" />
      <meta
        content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"
        name="viewport"
      />
      <meta content={title} name="apple-mobile-web-app-title" />
      <meta content={title} name="application-name" />
      <meta content={description} name="description" />
      <meta content="#000000" name="msapplication-TileColor" />
      <meta content="#fff" media="(prefers-color-scheme: light)" name="theme-color" />
      <meta content="#000" media="(prefers-color-scheme: dark)" name="theme-color" />
      <meta content="yes" name="apple-mobile-web-app-capable" />
      <meta content={title} name="apple-mobile-web-app-title" />
      <meta content="black-translucent" name="apple-mobile-web-app-status-bar-style" />
      {withManifest && <link href="/site.webmanifest" rel="manifest" />}
    </>
  );
};

export default Meta;
