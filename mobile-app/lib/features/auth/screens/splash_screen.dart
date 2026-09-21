import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/storage/hive_service.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/widgets/app_logo.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateNext();
  }

  Future<void> _navigateNext() async {
    // Show splash screen for 1.4 seconds
    await Future.delayed(const Duration(milliseconds: 1400));

    // Make sure the screen is still mounted after the async operation
    if (!mounted) return;

    // Read local authentication state
    final seenOnboarding = HiveService.instance.onboardingSeen;
    final accessToken = await HiveService.instance.getAccessToken();

    // Check mounted again because another async operation occurred
    if (!mounted) return;

    final hasToken = accessToken != null;

    // Get the router after confirming that the widget is mounted.
    final router = GoRouter.of(context);

    if (!seenOnboarding) {
      router.go('/onboarding');
    } else if (hasToken) {
      router.go('/home');
    } else {
      router.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 112,
              height: 112,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(30),
              ),
              child: const AppLogo(
                size: 72,
                variant: AppLogoVariant.white,
              ),
            ),

            const SizedBox(height: 24),

            Text(
              AppConstants.appName,
              style: theme.textTheme.headlineSmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              'See it before you buy it',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }
}