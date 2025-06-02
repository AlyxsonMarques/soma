/**
 * Utilitários para manipulação de imagens
 */

/**
 * Formata a URL da imagem para garantir que seja exibida corretamente
 * - Se a imagem for base64, retorna o base64 diretamente
 * - Se a imagem for um caminho relativo, adiciona a URL da API
 * - Se a imagem for uma URL completa, retorna a URL diretamente
 */
export function formatImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    // Retorna uma imagem placeholder se não houver imagem
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  }

  // Se for base64, retorna diretamente
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Se for um caminho relativo, adiciona a URL da API
  if (imageUrl.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
  }

  // Se for uma URL completa, retorna diretamente
  return imageUrl;
}
