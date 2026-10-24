export interface AzzarIconCdnConfig {
  cdn?: 'github' | 'aliyun' | 'unpkg';
  format?: 'svg' | 'png' | 'webp' | 'avatar';
  isDarkMode?: boolean;
  type?: 'mono' | 'color' | 'text' | 'text-cn' | 'text-color' | 'brand' | 'brand-color';
}

// AZZAR_TODO: host our own icon CDN assets
const GITHUB_ICON_CDN = (type: AzzarIconCdnConfig['format']) =>
  `https://example.com/azzar-icons/${type}`;
const ALIYUN_ICON_CDN = (type: AzzarIconCdnConfig['format']) =>
  `https://example.com/azzar-icons/${type}`;
const UNPKG_ICON_CDN = (type: AzzarIconCdnConfig['format']) =>
  `https://example.com/azzar-icons/${type}`;

export const getAzzarIconCDN = (id: string, config?: AzzarIconCdnConfig): string => {
  const { format = 'png', isDarkMode = false, type = 'color', cdn = 'github' } = config || {};
  let baseUrl = '';
  switch (cdn) {
    case 'github': {
      baseUrl = GITHUB_ICON_CDN(format);
      break;
    }
    case 'unpkg': {
      baseUrl = UNPKG_ICON_CDN(format);
      break;
    }
    case 'aliyun': {
      baseUrl = ALIYUN_ICON_CDN(format);
    }
  }

  if (format === 'avatar') {
    return `${baseUrl}/avatars/${id.toLowerCase()}.webp`;
  } else {
    const addon = type === 'mono' ? '' : `-${type}`;

    switch (format) {
      case 'svg': {
        return `${baseUrl}/icons/${id.toLowerCase() + addon}.svg`;
      }
      case 'webp': {
        return `${baseUrl}/${isDarkMode ? 'dark' : 'light'}/${id.toLowerCase() + addon}.webp`;
      }
      default: {
        return `${baseUrl}/${isDarkMode ? 'dark' : 'light'}/${id.toLowerCase() + addon}.png`;
      }
    }
  }
};
