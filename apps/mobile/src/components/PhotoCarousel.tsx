import React, { useState } from 'react';
import {
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width,
    height: 300,
    backgroundColor: '#e0e0e0',
  },
  image: {
    width,
    height: 300,
  },
  emptyText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextContent: {
    fontSize: 14,
    color: '#999',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
});

interface Photo {
  url: string;
  caption?: string;
}

interface PhotoCarouselProps {
  photos: Photo[];
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyText}>
          <Text style={styles.emptyTextContent}>No photos available</Text>
        </View>
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={({ item }) => (
          <Image source={{ uri: item.url }} style={styles.image} />
        )}
        keyExtractor={(item, idx) => `photo-${idx}`}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.paginationContainer}>
        {photos.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.paginationDot,
              currentIndex === idx && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};
