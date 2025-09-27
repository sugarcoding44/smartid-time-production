import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'services/auth_service.dart';
import 'services/supabase_service.dart';
import 'services/dashboard_service.dart';
import 'services/attendance_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase
  await SupabaseService.initialize();
  
  runApp(const SmartIdHubApp());
}

class SmartIdHubApp extends StatelessWidget {
  const SmartIdHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => DashboardService()),
        ChangeNotifierProvider(create: (_) => AttendanceService()),
      ],
      child: MaterialApp(
        title: 'SmartID Hub',
        debugShowCheckedModeBanner: false,
        theme: SmartIdTheme.darkTheme,
        darkTheme: SmartIdTheme.darkTheme,
        themeMode: ThemeMode.dark,
        home: const AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthService>(
      builder: (context, authService, child) {
        if (authService.isAuthenticated) {
          return const DashboardScreen();
        }
        return const LoginScreen();
      },
    );
  }
}

// SmartID Hub Theme - Matching Next.js design system
class SmartIdTheme {
  // Color system matching Next.js globals.css
  static const Color slate900 = Color(0xFF0f172a);  // background
  static const Color slate800 = Color(0xFF1e293b);  // card
  static const Color slate700 = Color(0xFF334155);  // secondary/border
  static const Color slate600 = Color(0xFF475569);
  static const Color slate500 = Color(0xFF64748b);
  static const Color slate400 = Color(0xFF94a3b8);  // muted-foreground
  static const Color slate300 = Color(0xFFcbd5e1);
  static const Color slate200 = Color(0xFFe2e8f0);
  static const Color slate100 = Color(0xFFf1f5f9);
  static const Color slate50 = Color(0xFFf8fafc);   // foreground
  
  // Indigo accent colors
  static const Color indigo500 = Color(0xFF6366f1);  // primary
  static const Color indigo600 = Color(0xFF4f46e5);
  static const Color indigo400 = Color(0xFF818cf8);
  static const Color indigo300 = Color(0xFFa5b4fc);
  static const Color indigo900 = Color(0xFF312e81);
  
  // Blue colors
  static const Color blue500 = Color(0xFF3b82f6);
  static const Color blue800 = Color(0xFF1e40af);
  static const Color blue400 = Color(0xFF60a5fa);
  
  // Status colors matching Next.js
  static const Color emerald400 = Color(0xFF34d399);
  static const Color green400 = Color(0xFF4ade80);
  static const Color green500 = Color(0xFF22c55e);
  static const Color amber400 = Color(0xFFfbbf24);
  static const Color orange500 = Color(0xFFf97316);
  static const Color violet400 = Color(0xFFa78bfa);
  static const Color red400 = Color(0xFFf87171);
  static const Color purple800 = Color(0xFF6b21a8);
  static const Color violet900 = Color(0xFF4c1d95);
  
  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      primaryColor: indigo500,
      scaffoldBackgroundColor: slate900,
      colorScheme: const ColorScheme.dark(
        primary: indigo500,
        primaryContainer: indigo600,
        secondary: slate700,
        secondaryContainer: slate600,
        surface: slate800,
        surfaceContainerHighest: slate700,
        background: slate900,
        error: red400,
        onPrimary: slate50,
        onSecondary: slate50,
        onSurface: slate50,
        onBackground: slate50,
        onError: slate50,
        outline: slate700,
        shadow: Colors.black,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: slate50, fontWeight: FontWeight.w700),
        displayMedium: TextStyle(color: slate50, fontWeight: FontWeight.w600),
        displaySmall: TextStyle(color: slate50, fontWeight: FontWeight.w600),
        headlineLarge: TextStyle(color: slate50, fontWeight: FontWeight.w600),
        headlineMedium: TextStyle(color: slate50, fontWeight: FontWeight.w600),
        headlineSmall: TextStyle(color: slate50, fontWeight: FontWeight.w600),
        titleLarge: TextStyle(color: slate50, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: slate50, fontWeight: FontWeight.w500),
        titleSmall: TextStyle(color: slate50, fontWeight: FontWeight.w500),
        bodyLarge: TextStyle(color: slate50, fontWeight: FontWeight.w400),
        bodyMedium: TextStyle(color: slate50, fontWeight: FontWeight.w400),
        bodySmall: TextStyle(color: slate400, fontWeight: FontWeight.w400),
        labelLarge: TextStyle(color: slate50, fontWeight: FontWeight.w500),
        labelMedium: TextStyle(color: slate400, fontWeight: FontWeight.w500),
        labelSmall: TextStyle(color: slate400, fontWeight: FontWeight.w400),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: slate50),
        titleTextStyle: TextStyle(
          color: slate50,
          fontSize: 20,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
      cardTheme: CardThemeData(
        color: slate800,
        elevation: 0,
        shadowColor: Colors.black.withOpacity(0.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: slate700, width: 1),
        ),
        margin: const EdgeInsets.all(8),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: indigo500,
          foregroundColor: slate50,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: const TextStyle(
            fontSize: 16, 
            fontWeight: FontWeight.w600,
            fontFamily: 'Inter',
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: slate700,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slate700),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slate700),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: indigo500, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: red400),
        ),
        labelStyle: const TextStyle(color: slate400),
        hintStyle: const TextStyle(color: slate400),
      ),
    );
  }

  static MaterialColor _createMaterialColor(Color color) {
    final strengths = <double>[0.05];
    final swatch = <int, Color>{};
    final r = color.red, g = color.green, b = color.blue;

    for (var i = 1; i < 10; i++) {
      strengths.add(0.1 * i);
    }

    for (var strength in strengths) {
      final ds = 0.5 - strength;
      final shade = Color.fromRGBO(
        r + ((ds < 0 ? r : (255 - r)) * ds).round(),
        g + ((ds < 0 ? g : (255 - g)) * ds).round(),
        b + ((ds < 0 ? b : (255 - b)) * ds).round(),
        1,
      );
      swatch[(strength * 1000).round()] = shade; // 50,100,...900
    }

    return MaterialColor(color.value, swatch);
  }
}
