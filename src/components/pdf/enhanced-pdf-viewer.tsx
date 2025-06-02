"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  children: React.ReactNode;
  fileName: string;
}

export const EnhancedPdfViewer: React.FC<PdfViewerProps> = ({ children, fileName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [html2pdf, setHtml2pdf] = useState<any>(null);

  // Carregar html2pdf dinamicamente no cliente
  useEffect(() => {
    import('html2pdf.js').then(module => {
      setHtml2pdf(() => module.default);
    });
  }, []);

  const generatePdf = async () => {
    if (!html2pdf || !contentRef.current || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Criar um iframe oculto para renderizar o conteúdo do PDF
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      // Acessar o documento do iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Não foi possível acessar o documento do iframe');
      
      // Escrever um documento HTML básico no iframe
      iframeDoc.open();
      iframeDoc.write('<html><head></head><body></body></html>');
      iframeDoc.close();
      
      // Copiar todos os estilos da página principal para o iframe
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      for (let i = 0; i < styles.length; i++) {
        try {
          const style = styles[i];
          if (style.tagName.toLowerCase() === 'link') {
            const linkEl = style.cloneNode(true) as HTMLLinkElement;
            iframeDoc.head.appendChild(linkEl);
          } else if (style instanceof HTMLStyleElement && style.sheet) {
            const styleEl = iframeDoc.createElement('style');
            try {
              // Tentar copiar o conteúdo do estilo diretamente
              if (style.textContent) {
                styleEl.textContent = style.textContent;
              }
              // Se não for possível, tentar acessar as regras CSS (pode falhar devido a CORS)
              else if (style.sheet.cssRules) {
                for (let j = 0; j < style.sheet.cssRules.length; j++) {
                  try {
                    const rule = style.sheet.cssRules[j];
                    styleEl.appendChild(iframeDoc.createTextNode(rule.cssText + '\n'));
                  } catch (e) {
                    // Ignora regras que não podem ser acessadas devido a CORS
                  }
                }
              }
              iframeDoc.head.appendChild(styleEl);
            } catch (e) {
              // Ignora erros ao acessar as regras CSS
            }
          }
        } catch (e) {
          // Ignora erros de CORS ao acessar folhas de estilo
        }
      }
      
      // Adiciona estilos específicos para o PDF
      const pdfStyles = iframeDoc.createElement('style');
      pdfStyles.textContent = `
        @page {
          margin: 10mm;
          size: A4;
        }
        
        body {
          margin: 0;
          padding: 0;
          background-color: white;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .pdf-container {
          background-color: white;
          color: black;
          padding: 20px;
          width: ${contentRef.current.offsetWidth}px;
          box-sizing: border-box;
        }
        
        /* Reset completo de margens e paddings */
        .pdf-container * {
          box-sizing: border-box !important;
        }
        
        /* Estilos para badges e avatares */
        .badge {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          vertical-align: middle !important;
          text-align: center !important;
          white-space: nowrap !important;
        }
        
        .avatar {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        /* Regras de quebra de página */
        .card, .section, article, .item, tr {
          page-break-inside: avoid !important;
        }
        
        h1, h2, h3, h4, h5, h6, thead, th {
          page-break-after: avoid !important;
        }
        
        /* Configurações para evitar órfãos e viúvas */
        p, li {
          orphans: 3 !important;
          widows: 3 !important;
        }
        
        /* Estilos para imagens */
        img {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid !important;
          display: block !important;
          margin: 10px auto !important;
        }
        
        /* Estilos para fotos de serviços */
        .service-photo-container {
          text-align: center !important;
          margin: 15px 0 !important;
          page-break-inside: avoid !important;
        }
        
        .service-photo {
          max-width: 90% !important;
          max-height: 300px !important;
          object-fit: contain !important;
          border-radius: 4px !important;
          border: 1px solid #e2e8f0 !important;
        }
      `;
      iframeDoc.head.appendChild(pdfStyles);
      
      // Cria um container para o conteúdo do PDF no iframe
      const pdfContainer = iframeDoc.createElement('div');
      pdfContainer.className = 'pdf-container';
      iframeDoc.body.appendChild(pdfContainer);
      
      // Clona o conteúdo original para o iframe
      const contentClone = contentRef.current.cloneNode(true) as HTMLElement;
      pdfContainer.appendChild(contentClone);
      
      // Pré-carregar todas as imagens antes de gerar o PDF
      const images = iframeDoc.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn(`Falha ao carregar imagem: ${img.src}`);
              resolve();
            };
            
            // Forçar recarregamento com cache busting
            const originalSrc = img.src;
            img.src = '';
            setTimeout(() => {
              img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'cachebust=' + new Date().getTime();
            }, 100);
          }
        });
      });
      
      // Aguardar todas as imagens carregarem
      await Promise.all(imagePromises);
      
      // Aguardar um pouco mais para garantir renderização completa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Configurar opções do html2pdf
      const options = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true,
          imageTimeout: 30000, // 30 segundos para carregar imagens
          logging: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // Gera o PDF a partir do conteúdo no iframe
      await html2pdf().set(options).from(pdfContainer).save();
      
      // Limpa o iframe após a geração
      document.body.removeChild(iframe);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      // Marca que terminou de gerar o PDF
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={generatePdf} 
          disabled={!html2pdf || isGenerating}
        >
          {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden" ref={contentRef}>
        {children}
      </div>
    </div>
  );
};
