# Mobile Server Setup Guide

## Current Status

✅ **Flutter is installed** - Version 3.32.8
✅ **Project structure exists** - smartid_hub_mobile directory
✅ **Missing colors fixed** - Added blue200 and blue300 to SmartIdTheme
❌ **Package corruption issue** - app_links package is corrupted

## Issues Identified

1. **Corrupted app_links package** - The supabase_flutter package depends on app_links, but it's corrupted in the pub cache
2. **Platform plugin warnings** - Multiple platform-specific packages are missing (these are just warnings)

## Fix Steps

### Step 1: Clear Flutter Pub Cache
```bash
flutter pub cache clean
```

### Step 2: Clean Project
```bash
cd smartid_hub_mobile
flutter clean
```

### Step 3: Re-download Dependencies
```bash
flutter pub get
```

### Step 4: Try Alternative Fix (if above doesn't work)
```bash
# Remove the corrupted package manually
rm -rf %LOCALAPPDATA%\Pub\Cache\hosted\pub.dev\app_links-6.4.1
flutter pub get
```

### Step 5: Start Mobile Server
Once the packages are fixed, you can start the mobile server:

```bash
# For Chrome/Web (easiest for development)
flutter run -d chrome --web-port=3001

# For Windows Desktop
flutter run -d windows

# For Android Emulator (if you have one running)
flutter run -d android
```

## Available Devices

Based on the flutter devices output, you have:
- **Windows Desktop** - Run as native Windows app
- **Chrome Web** - Run in Chrome browser
- **Edge Web** - Run in Edge browser

## Development URLs

Once started successfully:
- **Web App**: http://localhost:3001
- **Desktop App**: Runs as native Windows application

## Manual Fix Alternative

If the automated fix doesn't work, you can:

1. **Delete the entire pub cache**:
   ```bash
   flutter pub cache clean --force
   ```

2. **Restart your computer** (sometimes helps with Windows file locks)

3. **Re-run the setup**:
   ```bash
   cd smartid_hub_mobile
   flutter clean
   flutter pub get
   flutter run -d chrome --web-port=3001
   ```

## Expected Features

Once the mobile server is running, you'll have access to:

### 🏫 **SmartID TIME Mobile Features**
- User authentication and login
- Dashboard with attendance overview
- GPS location calibration screens (with/without maps)
- Profile management
- Leave requests
- Attendance marking

### 🗺️ **GPS Calibration System**
- **Basic Mode**: Simple GPS coordinate entry and address search
- **Advanced Mode**: Interactive Google Maps integration
- Real-time location detection
- Institution radius validation
- Address reverse geocoding

### 🎨 **UI/UX Features**
- Dark/Light theme support
- Responsive design
- Professional SmartID branding
- Material Design components
- Smooth animations and transitions

## Next Steps After Fix

1. **Test the mobile app** at http://localhost:3001
2. **Check GPS calibration features** are working
3. **Test integration with web backend** (currently running on :3003)
4. **Verify user authentication flow**

## Development Workflow

With both servers running:
- **Web Admin**: http://localhost:3003 (Next.js)
- **Mobile App**: http://localhost:3001 (Flutter Web)

This allows you to:
- Add users via web admin
- Send email invitations 
- Test mobile app login with created users
- Test GPS calibration features
- Monitor real-time integration

## Troubleshooting

If you continue to have issues:
1. Check Flutter doctor: `flutter doctor`
2. Update Flutter: `flutter upgrade`
3. Clear all caches: `flutter pub cache clean --force`
4. Restart your development environment

The mobile server should start successfully once the package corruption is resolved!