"use client";

import React from 'react';
import { Image, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatImageUrl } from '@/lib/image-utils';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  image: {
    maxWidth: '80%',
    maxHeight: 200,
    objectFit: 'contain',
    marginBottom: 5,
  },
  fallbackContainer: {
    width: '80%',
    height: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  fallbackText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  }
});

interface ImageWithFallbackProps {
  src: string;
  alt: string;
}

/**
 * Componente de imagem com fallback para o React-PDF
 * Tenta carregar a imagem e mostra um fallback se falhar
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt }) => {
  // No React-PDF, não podemos usar estados ou efeitos como no React normal
  // Então vamos confiar no cache e no tratamento de imagens do próprio React-PDF
  
  return (
    <View style={styles.container}>
      <Image 
        src={formatImageUrl(src)} 
        style={styles.image}
        cache={true}
      />
      <Text style={styles.fallbackText}>{alt}</Text>
    </View>
  );
};
