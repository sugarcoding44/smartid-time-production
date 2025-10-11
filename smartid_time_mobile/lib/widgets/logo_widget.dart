import 'package:flutter/material.dart';
// import 'package:flutter_svg/flutter_svg.dart'; // Temporarily disabled

class LogoWidget extends StatelessWidget {
  final double? height;
  final double? width;
  final BoxFit fit;
  
  const LogoWidget({
    super.key,
    this.height,
    this.width,
    this.fit = BoxFit.contain,
  });

  // Convenience constructors for common sizes
  const LogoWidget.small({
    super.key,
    this.fit = BoxFit.contain,
  }) : height = 24, width = 80;

  const LogoWidget.medium({
    super.key,
    this.fit = BoxFit.contain,
  }) : height = 32, width = 100;

  const LogoWidget.large({
    super.key,
    this.fit = BoxFit.contain,
  }) : height = 48, width = 150;

  @override
  Widget build(BuildContext context) {
    // Theme detection (for future SVG re-enablement)
    // final brightness = Theme.of(context).brightness;
    // final isDarkMode = brightness == Brightness.dark;
    // final logoPath = isDarkMode 
    //     ? 'assets/images/logo-light.svg'  // Light logo for dark mode
    //     : 'assets/images/logo-dark.svg';   // Dark logo for light mode
    
    // Use branded fallback for now (SVG loading issues resolved later)
    // The fallback actually looks quite professional!
    return _buildFallback(context);
    
    // TODO: Re-enable SVG loading once asset issues are resolved
    // try {
    //   return SvgPicture.asset(
    //     logoPath,
    //     height: height,
    //     width: width,
    //     fit: fit,
    //     placeholderBuilder: (BuildContext context) => _buildFallback(context),
    //     errorBuilder: (BuildContext context, dynamic error, StackTrace? stackTrace) {
    //       print('❌ SVG Logo Error for $logoPath: $error');
    //       return _buildFallback(context);
    //     },
    //   );
    // } catch (e) {
    //   print('❌ SVG Logo Exception: $e');
    //   return _buildFallback(context);
    // }
  }
  
  Widget _buildFallback(BuildContext context) {
    return Container(
      height: height ?? 32,
      width: width ?? 100,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFA855F7), // Purple 500
            Color(0xFF7C3AED), // Violet 600
          ],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0xFF7C3AED).withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Center(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Circular logo with 'S' letter
            Container(
              width: (height ?? 32) * 0.7,
              height: (height ?? 32) * 0.7,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [
                      Color(0xFF7C3AED), // Violet 600
                      Color(0xFF6366F1), // Indigo 500
                    ],
                  ).createShader(bounds),
                  child: Text(
                    'S',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: (height ?? 32) * 0.35,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Brand text
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SmartID',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: (height ?? 32) * 0.28,
                    letterSpacing: 0.5,
                    height: 0.9,
                  ),
                ),
                Text(
                  'TIME',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontWeight: FontWeight.w600,
                    fontSize: (height ?? 32) * 0.22,
                    letterSpacing: 1.0,
                    height: 0.8,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
