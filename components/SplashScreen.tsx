import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

// ABSOLUTE SINGLE SPLASH GUARANTEE - Global prevention
let SPLASH_EXECUTION_COUNT = 0;
const MAX_SPLASH_EXECUTIONS = 1;

export default function AppSplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [executionId] = useState(() => ++SPLASH_EXECUTION_COUNT);

  useEffect(() => {
    // BULLETPROOF SINGLE EXECUTION GUARANTEE
    if (executionId > MAX_SPLASH_EXECUTIONS) {
      console.log(`SplashScreen: BLOCKED execution #${executionId} - Only allowing 1 splash screen`);
      onAnimationComplete();
      return;
    }

    console.log(`SplashScreen: APPROVED execution #${executionId} - Starting GUARANTEED SINGLE splash`);
    
    // Hide any native splash screen immediately
    SplashScreen.hideAsync().catch(() => {
      console.log('Native splash already hidden or not present');
    });
    
    // Start animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000), // Hold for 1 second (total 1.5s)
    ]).start(() => {
      console.log(`SplashScreen: Execution #${executionId} animation completed - transitioning to home`);
      onAnimationComplete();
    });
    
    // ABSOLUTE FAILSAFE: Force completion after 1.5 seconds
    const absoluteTimeout = setTimeout(() => {
      console.log(`SplashScreen: Execution #${executionId} FAILSAFE triggered - forcing completion`);
      onAnimationComplete();
    }, 1500);
    
    return () => {
      clearTimeout(absoluteTimeout);
    };
  }, []); // NO dependencies - execute once only

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FDE7EF" barStyle="dark-content" />
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/branding/mht_logo_primary.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE7EF', // Light pink background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.5, // 50% of screen width
    height: width * 0.5, // Keep it square
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});