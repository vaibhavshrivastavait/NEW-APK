#!/usr/bin/env python3
"""
MHT Assessment Android Assets Generator
Generates all required app icons and splash screens for Android
"""

import os
from PIL import Image, ImageDraw, ImageFont
import sys

# Color scheme
BACKGROUND_COLOR = "#FDE7EF"  # Light pink background
ACCENT_COLOR = "#D81B60"      # MHT brand pink

# Paths
LOGO_PATH = "/app/assets/images/branding/mht_logo_primary.png"
ANDROID_RES_PATH = "/app/android/app/src/main/res"
ASSETS_PATH = "/app/assets"

# Android icon sizes (mipmap)
ICON_SIZES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192
}

# Android splash screen sizes (drawable)
SPLASH_SIZES = {
    "mdpi": (320, 480),
    "hdpi": (480, 800),  
    "xhdpi": (720, 1280),
    "xxhdpi": (1080, 1920),
    "xxxhdpi": (1440, 2560)
}

def create_circular_icon(logo_path, size, output_path):
    """Create a circular app icon from the logo"""
    try:
        # Open and resize logo
        logo = Image.open(logo_path).convert("RGBA")
        
        # Create a square background with padding
        background = Image.new("RGBA", (size, size), BACKGROUND_COLOR)
        
        # Calculate logo size (80% of icon size to leave padding)
        logo_size = int(size * 0.8)
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Center the logo on background
        logo_pos = ((size - logo_size) // 2, (size - logo_size) // 2)
        background.paste(logo, logo_pos, logo)
        
        # Create circular mask
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        
        # Apply circular mask
        circular_icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        circular_icon.paste(background, (0, 0))
        circular_icon.putalpha(mask)
        
        # Save the icon
        circular_icon.save(output_path, "PNG", optimize=True)
        print(f"✅ Created icon: {output_path} ({size}x{size})")
        
    except Exception as e:
        print(f"❌ Error creating icon {output_path}: {e}")

def create_square_icon(logo_path, size, output_path):
    """Create a square app icon from the logo"""
    try:
        # Open and resize logo
        logo = Image.open(logo_path).convert("RGBA")
        
        # Create a square background with rounded corners
        background = Image.new("RGBA", (size, size), BACKGROUND_COLOR)
        
        # Calculate logo size (70% of icon size)
        logo_size = int(size * 0.7)
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Center the logo on background
        logo_pos = ((size - logo_size) // 2, (size - logo_size) // 2)
        background.paste(logo, logo_pos, logo)
        
        # Add subtle border
        draw = ImageDraw.Draw(background)
        border_width = max(1, size // 48)
        draw.rectangle([0, 0, size-1, size-1], outline=ACCENT_COLOR, width=border_width)
        
        # Save the icon
        background.save(output_path, "PNG", optimize=True)
        print(f"✅ Created icon: {output_path} ({size}x{size})")
        
    except Exception as e:
        print(f"❌ Error creating icon {output_path}: {e}")

def create_splash_screen(logo_path, width, height, output_path):
    """Create a splash screen with centered logo"""
    try:
        # Create background
        splash = Image.new("RGB", (width, height), BACKGROUND_COLOR)
        
        # Open logo
        logo = Image.open(logo_path).convert("RGBA")
        
        # Calculate logo size (25% of screen width, max 200px)
        logo_width = min(int(width * 0.25), 200)
        logo_height = int(logo_width * logo.height / logo.width)  # Maintain aspect ratio
        logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        
        # Center the logo
        logo_x = (width - logo_width) // 2
        logo_y = (height - logo_height) // 2
        
        # Paste logo on splash screen
        splash.paste(logo, (logo_x, logo_y), logo)
        
        # Try to add "MHT Assessment" text below logo
        try:
            draw = ImageDraw.Draw(splash)
            
            # Calculate font size based on screen width
            font_size = max(16, int(width * 0.04))
            
            # Try to use a nice font, fallback to default
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
                except:
                    font = ImageFont.load_default()
            
            text = "MHT Assessment"
            
            # Get text dimensions
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Position text below logo
            text_x = (width - text_width) // 2
            text_y = logo_y + logo_height + int(height * 0.02)
            
            # Draw text with shadow effect
            shadow_offset = max(1, font_size // 20)
            draw.text((text_x + shadow_offset, text_y + shadow_offset), text, fill="#000000", font=font)
            draw.text((text_x, text_y), text, fill=ACCENT_COLOR, font=font)
            
        except Exception as text_error:
            print(f"⚠️  Could not add text to splash screen: {text_error}")
        
        # Save splash screen
        splash.save(output_path, "PNG", optimize=True)
        print(f"✅ Created splash screen: {output_path} ({width}x{height})")
        
    except Exception as e:
        print(f"❌ Error creating splash screen {output_path}: {e}")

def main():
    print("🚀 MHT Assessment Android Assets Generator")
    print("==========================================")
    
    # Check if logo exists
    if not os.path.exists(LOGO_PATH):
        print(f"❌ Logo not found at: {LOGO_PATH}")
        sys.exit(1)
    
    print(f"📱 Using logo: {LOGO_PATH}")
    print(f"🎨 Background color: {BACKGROUND_COLOR}")
    print(f"🎨 Accent color: {ACCENT_COLOR}")
    print()
    
    # Create app icons for all densities
    print("📱 Generating App Icons...")
    print("-" * 30)
    
    for density, size in ICON_SIZES.items():
        # Create directory if it doesn't exist
        mipmap_dir = os.path.join(ANDROID_RES_PATH, f"mipmap-{density}")
        os.makedirs(mipmap_dir, exist_ok=True)
        
        # Create square icon (ic_launcher.png)
        square_icon_path = os.path.join(mipmap_dir, "ic_launcher.png")
        create_square_icon(LOGO_PATH, size, square_icon_path)
        
        # Create circular icon (ic_launcher_round.png)
        round_icon_path = os.path.join(mipmap_dir, "ic_launcher_round.png")
        create_circular_icon(LOGO_PATH, size, round_icon_path)
    
    # Create Play Store icon (512x512)
    print("\n🏪 Generating Play Store Icon...")
    print("-" * 30)
    play_store_dir = os.path.join(ASSETS_PATH, "play-store")
    os.makedirs(play_store_dir, exist_ok=True)
    play_store_icon = os.path.join(play_store_dir, "ic_launcher_512.png")
    create_square_icon(LOGO_PATH, 512, play_store_icon)
    
    # Create splash screens for all densities
    print("\n🌅 Generating Splash Screens...")
    print("-" * 30)
    
    for density, (width, height) in SPLASH_SIZES.items():
        # Create directory if it doesn't exist
        drawable_dir = os.path.join(ANDROID_RES_PATH, f"drawable-{density}")
        os.makedirs(drawable_dir, exist_ok=True)
        
        # Create splash screen
        splash_path = os.path.join(drawable_dir, "splashscreen_image.png")
        create_splash_screen(LOGO_PATH, width, height, splash_path)
    
    # Create a default splash screen in drawable folder
    print("\n🎨 Creating Default Splash Screen...")
    print("-" * 30)
    default_splash = os.path.join(ANDROID_RES_PATH, "drawable", "splashscreen_image.png")
    create_splash_screen(LOGO_PATH, 720, 1280, default_splash)  # Use xhdpi as default
    
    print("\n✅ ANDROID ASSETS GENERATION COMPLETE!")
    print("=" * 50)
    print("📁 Generated assets:")
    print(f"   • App icons: {len(ICON_SIZES)} densities × 2 variants = {len(ICON_SIZES) * 2} icons")
    print(f"   • Splash screens: {len(SPLASH_SIZES)} densities + 1 default = {len(SPLASH_SIZES) + 1} images")
    print(f"   • Play Store icon: 1 × 512×512 image")
    print(f"   • Total files: {len(ICON_SIZES) * 2 + len(SPLASH_SIZES) + 2}")
    print()
    print("🔨 Next steps:")
    print("   1. Rebuild the Android app")
    print("   2. Test on emulator and physical device")
    print("   3. Verify icons appear correctly in launcher")
    print("   4. Check splash screen displays with branding")
    print()

if __name__ == "__main__":
    main()