import 'package:flutter/material.dart';

class SimpleLogoWidget extends StatelessWidget {
  final double? height;
  final double? width;
  
  const SimpleLogoWidget({
    super.key,
    this.height,
    this.width,
  });

  // Convenience constructors for common sizes
  const SimpleLogoWidget.small({
    super.key,
  }) : height = 24, width = 80;

  const SimpleLogoWidget.medium({
    super.key,
  }) : height = 32, width = 100;

  const SimpleLogoWidget.large({
    super.key,
  }) : height = 48, width = 150;

  @override
  Widget build(BuildContext context) {
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
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.schedule,
            color: Colors.white,
            size: (height ?? 32) * 0.4,
          ),
          const SizedBox(width: 6),
          Text(
            'SmartID TIME',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: (height ?? 32) * 0.25,
            ),
          ),
        ],
      ),
    );
  }
}