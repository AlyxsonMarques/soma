declare module 'html2pdf.js' {
  function html2pdf(): html2pdf.Html2PdfInstance;
  
  namespace html2pdf {
    interface Html2PdfInstance {
      set(options: Html2PdfOptions): Html2PdfInstance;
      from(element: HTMLElement): Html2PdfInstance;
      save(): Promise<void>;
      outputPdf(type: string): Promise<Blob>;
    }
    
    interface Html2PdfOptions {
      margin?: number | number[];
      filename?: string;
      image?: {
        type?: string;
        quality?: number;
      };
      html2canvas?: {
        scale?: number;
        useCORS?: boolean;
        letterRendering?: boolean;
        [key: string]: any;
      };
      jsPDF?: {
        unit?: string;
        format?: string;
        orientation?: 'portrait' | 'landscape';
        [key: string]: any;
      };
      [key: string]: any;
    }
  }
  
  export = html2pdf;
}
