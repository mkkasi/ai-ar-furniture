import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Persistent bottom navigation bar shared across the primary tabs
/// (Home, Search, Favorites, Saved Designs, Profile).
class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  static const _tabs = ['/home', '/search', '/favorites', '/saved-designs', '/profile'];

  int _indexForLocation(String location) {
    final index = _tabs.indexWhere((t) => location.startsWith(t));
    return index == -1 ? 0 : index;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final currentIndex = _indexForLocation(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) => context.go(_tabs[index]),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search), label: 'Search'),
          NavigationDestination(icon: Icon(Icons.favorite_border), selectedIcon: Icon(Icons.favorite), label: 'Favorites'),
          NavigationDestination(icon: Icon(Icons.view_in_ar_outlined), selectedIcon: Icon(Icons.view_in_ar), label: 'Designs'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
