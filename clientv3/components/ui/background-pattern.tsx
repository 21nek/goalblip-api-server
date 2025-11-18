import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { Svg, Circle, Defs, Pattern, Rect } from 'react-native-svg';

export function BackgroundPattern() {
  if (Platform.OS === 'web') {
    // Web için CSS background-image kullan
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0),
              radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 1px, transparent 0)
            `,
            backgroundSize: '50px 50px',
            pointerEvents: 'none',
            zIndex: 0,
          } as any,
        ]}
      />
    );
  }

  // Native için SVG pattern
  const { width, height } = Dimensions.get('window');
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="dotPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <Circle cx="1" cy="1" r="1" fill="rgba(255, 255, 255, 0.05)" />
            <Circle cx="25" cy="25" r="1" fill="rgba(255, 255, 255, 0.05)" />
          </Pattern>
        </Defs>
        <Rect width={width} height={height} fill="url(#dotPattern)" />
      </Svg>
    </View>
  );
}

