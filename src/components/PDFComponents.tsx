import React from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuration du worker PDF.js
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PDFComponentsProps {
  file: File;
  pageNumber: number;
  onLoadSuccess: (pdf: any) => void;
  onPageLoadSuccess: (page: any) => void;
  onLoadError: (error: Error) => void;
  width?: number;
  height?: number;
}

const PDFComponents: React.FC<PDFComponentsProps> = ({
  file,
  pageNumber,
  onLoadSuccess,
  onPageLoadSuccess,
  onLoadError,
  width,
  height
}) => {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      options={{
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.8.162/cmaps/',
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
