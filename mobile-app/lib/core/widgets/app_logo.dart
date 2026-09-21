import 'package:flutter/material.dart';

/// The AR Furniture Studio mark: a sofa silhouette framed by AR viewfinder
/// corner brackets. Two pre-rendered variants are bundled — [AppLogoVariant.white]
/// for dark/brand-colored backgrounds (splash, onboarding hero) and
/// [AppLogoVariant.sage] for light backgrounds (in-app headers, about screen).
enum AppLogoVariant { white, sage }

class AppLogo extends StatelessWidget {
  final double size;
  final AppLogoVariant variant;

  const AppLogo({super.key, this.size = 96, this.variant = AppLogoVariant.white});

  @override
  Widget build(BuildContext context) {
    final asset = variant == AppLogoVariant.white ? 'assets/images/logo_white.png' : 'assets/images/logo_sage.png';
    return Image.asset(asset, width: size, height: size);
  }
}
