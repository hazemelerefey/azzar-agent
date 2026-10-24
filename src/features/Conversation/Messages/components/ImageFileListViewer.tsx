import { type ChatImageItem } from '@azzar/types';
import { PreviewGroup } from '@azzar/ui';
import { memo } from 'react';

import GalleyGrid from '@/components/GalleyGrid';
import ImageItem from '@/components/ImageItem';

import { downloadPreviewImage } from './downloadPreviewImage';

interface FileListProps {
  items: ChatImageItem[];
}

const ImageFileListViewer = memo<FileListProps>(({ items }) => {
  return (
    <PreviewGroup preview={{ onDownload: downloadPreviewImage }}>
      <GalleyGrid items={items} renderItem={ImageItem} />
    </PreviewGroup>
  );
});

export default ImageFileListViewer;
