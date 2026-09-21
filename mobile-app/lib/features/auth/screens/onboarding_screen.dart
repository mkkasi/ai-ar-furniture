import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../../core/storage/hive_service.dart';

class _OnboardPage {
  final IconData icon;
  final String title;
  final String description;
  const _OnboardPage(this.icon, this.title, this.description);
}

const _pages = [
  _OnboardPage(
    Icons.view_in_ar_rounded,
    'Try before you buy',
    'Place true-to-scale 3D furniture in your own room using your camera.',
  ),
  _OnboardPage(
    Icons.auto_awesome_rounded,
    'Smart recommendations',
    'Get AI-powered suggestions that match your room size, colors, and budget.',
  ),
  _OnboardPage(
    Icons.bookmark_added_rounded,
    'Save your designs',
    'Save, rename, and revisit your AR room layouts any time.',
  ),
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  Future<void> _finish() async {
    await HiveService.instance.setOnboardingSeen(true);
    if (mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _index == _pages.length - 1;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: TextButton(onPressed: _finish, child: const Text('Skip')),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (context, i) {
                  final page = _pages[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(page.icon, size: 96, color: Theme.of(context).colorScheme.primary),
                        const SizedBox(height: 32),
                        Text(page.title,
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 12),
                        Text(page.description,
                            textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
                      ],
                    ),
                  );
                },
              ),
            ),
            SmoothPageIndicator(
              controller: _controller,
              count: _pages.length,
              effect: ExpandingDotsEffect(
                dotHeight: 8,
                dotWidth: 8,
                activeDotColor: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: ElevatedButton(
                onPressed: () {
                  if (isLast) {
                    _finish();
                  } else {
                    _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
                  }
                },
                child: Text(isLast ? 'Get Started' : 'Next'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
