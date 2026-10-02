import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

const logo = require('../../assets/passionfruit-logo.jpg');

interface PassionFruitLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function PassionFruitLogo({ size = 40, style }: PassionFruitLogoProps) {
  return (
    <Image
      source={logo}
      style={[{ width: size, height: size, borderRadius: size * 0.42 }, style]}
      resizeMode="contain"
    />
  );
}
