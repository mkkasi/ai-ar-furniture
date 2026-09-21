import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/onboarding_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/otp_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/reset_password_screen.dart';

import '../../features/home/screens/home_screen.dart';
import '../../features/home/screens/search_screen.dart';
import '../../features/furniture_details/screens/furniture_details_screen.dart';
import '../../features/ar/screens/ar_view_screen.dart';
import '../../features/favorites/screens/favorites_screen.dart';
import '../../features/saved_designs/screens/saved_designs_screen.dart';
import '../../features/saved_designs/screens/design_viewer_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';
import '../../features/settings/screens/settings_screen.dart';
import '../../features/ai_design/screens/interior_design_screen.dart';
import '../../features/ai_visual_search/screens/visual_search_screen.dart';
import '../../features/ai_chat/screens/ai_chat_screen.dart';
import '../../features/product_360/screens/product_360_view_screen.dart';
import '../widgets/main_shell.dart';

/// App-wide navigation graph using go_router, with a persistent
/// bottom-nav shell for the primary tabs.
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(
        path: '/verify-otp',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return OtpScreen(email: extra['email'], purpose: extra['purpose']);
        },
      ),
      GoRoute(path: '/forgot-password', builder: (context, state) => const ForgotPasswordScreen()),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return ResetPasswordScreen(resetToken: extra?['resetToken'] ?? '');
        },
      ),

      // Bottom-nav shell wraps the primary tabs
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
          GoRoute(path: '/search', builder: (context, state) => const SearchScreen()),
          GoRoute(path: '/favorites', builder: (context, state) => const FavoritesScreen()),
          GoRoute(path: '/saved-designs', builder: (context, state) => const SavedDesignsScreen()),
          GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
        ],
      ),

      GoRoute(
        path: '/furniture/:id',
        builder: (context, state) => FurnitureDetailsScreen(furnitureId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/ar-view/:id',
        builder: (context, state) => ArViewScreen(furnitureId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/design/:id',
        builder: (context, state) => DesignViewerScreen(designId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/notifications', builder: (context, state) => const NotificationsScreen()),
      GoRoute(path: '/edit-profile', builder: (context, state) => const EditProfileScreen()),
      GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
      GoRoute(path: '/ai-interior-design', builder: (context, state) => const InteriorDesignScreen()),
      GoRoute(path: '/ai-visual-search', builder: (context, state) => const VisualSearchScreen()),
      GoRoute(path: '/ai-chat', builder: (context, state) => const AiChatScreen()),
      GoRoute(
        path: '/product-360',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return Product360ViewScreen(modelUrl: extra['modelUrl'], itemName: extra['itemName']);
        },
      ),
    ],
  );
});
