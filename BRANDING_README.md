# MHT Assessment App - Branding & Assets Guide

## Logo Assets

### Location
- **Primary Logo**: `/app/frontend/assets/images/branding/mht_logo_primary.png`
- **Alternate Logo**: `/app/frontend/assets/images/branding/mht_logo_alt.png`

### Usage
- **Primary**: White background version for light themes and splash screens
- **Alternate**: Dark/ambient version for dark themes (currently same as primary)

### Specifications
- Format: PNG with transparency
- Size: Multiple resolutions (1024×1024, 512×512, 256×256, 128×128)
- Safe area: 18% padding on all sides for adaptive icons

## Color Palette

```
Primary magenta:    #D81B60
Light pink:         #FDE7EF  (surfaces/splash background)
Secondary pink:     #FFC1CC  (headers)
Neutral text:       #212121
White:              #FFFFFF
```

## Splash Screen Implementation

### Components
- **Main Component**: `/app/frontend/components/SplashScreen.tsx`
- **Integration**: `/app/frontend/App.tsx` (handles splash state)

### Animation Sequence
1. **Fade-in**: 0→100% opacity in 600ms
2. **Scale**: 1.0→1.08 subtle scale in 600ms  
3. **Hold**: 400ms pause
4. **Transition**: Fade to main app

### Performance
- Total duration: 1.5-2.0 seconds
- Background: Light pink (#FDE7EF)
- Logo size: 40% of shortest screen dimension

## Settings Integration

### Sound Control
- **Settings Screen**: `/app/frontend/screens/SettingsScreen.tsx`
- **Storage Key**: `welcome_sound_enabled` (AsyncStorage)
- **Default**: Enabled (true)

### Navigation
- Access via: Home → Settings
- Toggle: "Play Welcome Sound" 
- Preview: Test button (respects system ringer mode)

## App Configuration

### app.json Updates
```json
{
  "splash": {
    "image": "./assets/images/branding/mht_logo_primary.png",
    "resizeMode": "contain", 
    "backgroundColor": "#FDE7EF"
  },
  "icon": "./assets/images/branding/mht_logo_primary.png"
}
```

## Audio Assets

### Welcome Chime
- **Location**: `/app/frontend/assets/sounds/welcome_chime.mp3`
- **Duration**: 100-300ms
- **Volume**: Soft, professional
- **Respect**: System ringer mode and user preference

### Implementation Notes
```javascript
// In production, use expo-av:
const { sound } = await Audio.Sound.createAsync(
  require('../assets/sounds/welcome_chime.mp3')
);
await sound.playAsync();
await sound.unloadAsync();
```

## Accessibility Features

- **Content Description**: "MHT Assessment logo"
- **Reduced Motion**: Static logo when system setting enabled
- **Contrast**: Maintains 4.5:1 ratio for all text
- **Screen Reader**: Proper semantic labeling

## Build Requirements

### Dependencies
```json
{
  "expo-splash-screen": "^0.20.5",
  "expo-av": "^13.4.1",
  "@react-native-async-storage/async-storage": "^1.19.3"
}
```

### Asset Generation
1. Export logo at multiple resolutions (1024px, 512px, 256px, 128px)
2. Generate adaptive icons for Android with 18% safe area padding
3. Create mipmaps in `res/mipmap-*` folders for native builds

### APK/AAB Build Steps
1. Ensure all assets are in correct locations
2. Run `expo build:android` or `eas build`
3. Verify splash screen appears correctly
4. Test sound functionality with different ringer modes

## Customization

### Changing Logo
1. Replace files in `/app/frontend/assets/images/branding/`
2. Maintain same filenames: `mht_logo_primary.png`, `mht_logo_alt.png`
3. Update `app.json` if changing asset paths
4. Rebuild app for changes to take effect

### Modifying Colors
1. Update color constants in component StyleSheets
2. Modify `app.json` splash backgroundColor
3. Ensure accessibility contrast ratios are maintained

### Sound Customization
1. Replace `/app/frontend/assets/sounds/welcome_chime.mp3`
2. Keep duration under 300ms for optimal UX
3. Test with system ringer modes (normal/silent/vibrate)

## Performance Targets

- **Cold start**: ≤2.5s on mid-range device
- **Splash minimum**: ≥1.2s (even if app loads faster)
- **Asset loading**: <300ms for logo and sound preload
- **Memory usage**: Efficient cleanup after splash completion

## Troubleshooting

### Common Issues
1. **Logo not appearing**: Check file paths in app.json and component imports
2. **Sound not playing**: Verify expo-av installation and permissions
3. **Splash too long**: Check animation timing and app initialization
4. **Settings not persisting**: Verify AsyncStorage setup and permissions

### Debug Mode
- Enable console logging in SplashScreen.tsx
- Check expo development tools for asset loading errors
- Test on both iOS and Android for platform differences

## Future Enhancements

- **Dynamic themes**: Light/dark mode logo switching
- **Seasonal variants**: Holiday or themed logo variations  
- **Animation variants**: Different splash animations for special events
- **Sound themes**: Multiple chime options for user selection
- **Branded components**: Consistent branding across all UI elements