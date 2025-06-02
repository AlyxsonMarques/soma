"use client";

import { FC, ReactNode, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PdfViewerProps {
  children: ReactNode;
  fileName: string;
}

/**
 * Componente PdfViewer - Renderiza o conteúdo e fornece um botão para baixar como PDF
 * Implementação otimizada para evitar qualquer layout shift durante a geração do PDF
 */
export const PdfViewer: FC<PdfViewerProps> = ({ children, fileName = 'documento.pdf' }) => {
  // Referência para o conteúdo que será convertido em PDF
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Estado para armazenar a biblioteca html2pdf carregada dinamicamente
  const [html2pdf, setHtml2pdf] = useState<any>(null);
  
  // Estado para controlar se está gerando o PDF
  const [isGenerating, setIsGenerating] = useState(false);

  // Carregar html2pdf.js dinamicamente para evitar erros de SSR
  useEffect(() => {
    import("html2pdf.js").then((module) => {
      setHtml2pdf(() => module.default);
    });
  }, []);

  /**
   * Gera o PDF a partir do conteúdo sem causar layout shift
   * Usa um iframe isolado para evitar qualquer alteração no DOM principal
   */
  const generatePdf = async () => {
    // Verifica se o conteúdo e a biblioteca estão disponíveis
    if (!contentRef.current || !html2pdf || isGenerating) return;
    
    // Marca que está gerando o PDF para evitar cliques múltiplos
    setIsGenerating(true);
    
    try {
      // Cria um iframe oculto para isolar completamente o processo
      const iframe = document.createElement('iframe');
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      
      // Adiciona o iframe ao DOM, mas completamente isolado
      document.body.appendChild(iframe);
      
      // Espera o iframe carregar
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.src = 'about:blank';
      });
      
      // Obtém o documento do iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Não foi possível acessar o documento do iframe');
      }
      
      // Cria a estrutura HTML básica no iframe
      iframeDoc.open();
      iframeDoc.write('<html><head></head><body></body></html>');
      iframeDoc.close();
      
      // Copia os estilos da página principal para o iframe
      const styles = Array.from(document.styleSheets);
      for (const style of styles) {
        try {
          // Para folhas de estilo externas
          if (style.href) {
            const linkEl = iframeDoc.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = style.href;
            iframeDoc.head.appendChild(linkEl);
          } 
          // Para estilos inline
          else if (style.cssRules) {
            const styleEl = iframeDoc.createElement('style');
            for (let i = 0; i < style.cssRules.length; i++) {
              try {
                const rule = style.cssRules[i];
                styleEl.appendChild(iframeDoc.createTextNode(rule.cssText + '\n'));
              } catch (e) {
                // Ignora regras que não podem ser acessadas devido a CORS
              }
            }
            iframeDoc.head.appendChild(styleEl);
          }
        } catch (e) {
          // Ignora erros de CORS ao acessar folhas de estilo
        }
      }
      
      // Adiciona estilos específicos para o PDF
      const pdfStyles = iframeDoc.createElement('style');
      pdfStyles.textContent = `
        body {
          margin: 0;
          padding: 0;
          background-color: white;
        }
        
        .pdf-container {
          background-color: white;
          color: black;
          padding: 20px;
          width: ${contentRef.current.offsetWidth}px;
        }
        
        /* Reset completo de margens, paddings e alinhamentos para todos os elementos */
        .pdf-container * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          vertical-align: middle !important;
        }
        
        /* Restaurar apenas alguns espaçamentos específicos */
        .pdf-container p {
          margin-bottom: 0.5em !important;
        }
        
        .pdf-container .card {
          margin-bottom: 1rem !important;
          padding: 1rem !important;
        }
        
        .pdf-container .card-header, 
        .pdf-container .card-content, 
        .pdf-container .card-footer {
          padding: 0.5rem !important;
        }
        
        /* Garantir que textos não desçam dentro das boxes */
        .badge, [class*="badge-"] {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 24px !important;
          min-height: 24px !important;
          padding: 0 0.5rem !important;
          white-space: nowrap !important;
          line-height: 1 !important;
          vertical-align: middle !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          border-radius: 9999px !important;
          margin: 0 !important;
        }
        
        /* Ajustes para o texto dentro dos badges */
        .badge span, [class*="badge-"] span,
        .badge *, [class*="badge-"] * {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
          display: inline-block !important;
          vertical-align: middle !important;
          position: static !important;
          transform: none !important;
        }
        
        .avatar, [class*="avatar-"] {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 2.5rem !important;
          height: 2.5rem !important;
          border-radius: 9999px !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .avatar-fallback {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
        }
        
        /* Garantir que o texto dentro do avatar esteja perfeitamente centralizado */
        .avatar-fallback * {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
          display: inline-block !important;
          vertical-align: middle !important;
          position: static !important;
          transform: none !important;
        }
        
        /* Regras de quebra de página para evitar conteúdo cortado */
        .card, .section, section, article, .item, tr, li, .flex, .grid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-top: 0 !important;
        }
        
        /* Garantir que títulos não fiquem isolados no final de uma página */
        h1, h2, h3, h4, h5, h6, thead, th {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        
        /* Evitar quebras de linha dentro de elementos inline importantes */
        .badge, .avatar, .chip, .tag, .label, strong, b, em, i, .highlight {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          white-space: nowrap !important;
        }
        
        /* Estilos para imagens no PDF */
        img {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          display: block !important;
          margin: 0.5rem auto !important;
        }
        
        /* Estilos para galerias de imagens */
        .image-gallery, .photos, .images, [class*="gallery"], [class*="photos"] {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 0.5rem !important;
          justify-content: center !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin: 1rem 0 !important;
        }
        
        /* Estilos para cada item da galeria */
        .image-gallery img, .photos img, .images img, [class*="gallery"] img, [class*="photos"] img {
          max-width: 45% !important;
          max-height: 200px !important;
          object-fit: cover !important;
          border-radius: 4px !important;
        }
        
        /* Garantir que parágrafos não sejam divididos com apenas uma linha */
        p {
          orphans: 3 !important; /* Mínimo de 3 linhas no início de um parágrafo */
          widows: 3 !important;  /* Mínimo de 3 linhas no final de um parágrafo */
        }
        
        /* Correção para divs com espaçamento no topo */
        div {
          margin-top: 0 !important;
          padding-top: 0 !important;
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
      
      // Configurar opções do html2pdf
      const options = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true,
          foreignObjectRendering: false,
          imageTimeout: 30000, // Aumentado para 30 segundos para garantir carregamento de imagens remotas
          logging: true, // Ativar logs para depuração
          onclone: function(clonedDoc: Document) {
            // Forçar carregamento de imagens no clone
            const images = clonedDoc.querySelectorAll('img');
            console.log(`Processando ${images.length} imagens no PDF`);
            
            images.forEach((img, index) => {
              // Adicionar crossOrigin para permitir imagens de outros domínios
              img.crossOrigin = 'anonymous';
              
              // Verificar se a imagem está carregada
              if (!img.complete || img.naturalHeight === 0) {
                console.log(`Recarregando imagem ${index + 1}: ${img.src}`);
                
                // Criar uma nova URL para forçar o recarregamento (evitar cache)
                const originalSrc = img.src;
                img.src = '';
                setTimeout(() => {
                  img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'cachebust=' + new Date().getTime();
                }, 100);
              } else {
                console.log(`Imagem ${index + 1} já carregada: ${img.src}`);
              }
            });
            
            // Adicionar um pequeno atraso para garantir que as imagens sejam processadas
            return new Promise(resolve => setTimeout(resolve, 1000));
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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

