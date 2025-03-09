import React from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface PDFComponentsProps {
  file: File;
  pageNumber: number;
  onLoadSuccess: (pdf: any) => void;
  onPageLoadSuccess: (page: any) => void;
  width: number;
  height: number;
}

const PDFComponents: React.FC<PDFComponentsProps> = ({
  file,
  pageNumber,
  onLoadSuccess,
  onPageLoadSuccess,
  width,
  height
}) => {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      options={{
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/cmaps/',
        cMapPacked: true,
      }}
    >
      <Page
        pageNumber={pageNumber}
        onLoadSuccess={onPageLoadSuccess}
        width={width}
        height={height}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );
};

export default PDFComponents;
