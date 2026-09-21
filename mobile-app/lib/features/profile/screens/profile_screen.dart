import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(
            child: CircleAvatar(
              radius: 44,
              backgroundImage: user?.avatarUrl != null ? CachedNetworkImageProvider(user!.avatarUrl!) : null,
              child: user?.avatarUrl == null ? const Icon(Icons.person, size: 40) : null,
            ),
          ),
          const SizedBox(height: 12),
          Center(child: Text(user?.name ?? '', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700))),
          Center(child: Text(user?.email ?? '', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey))),
          const SizedBox(height: 32),
          _tile(context, Icons.edit_outlined, 'Edit Profile', () => context.push('/edit-profile')),
          _tile(context, Icons.view_in_ar_outlined, 'Saved Designs', () => context.push('/saved-designs')),
          _tile(context, Icons.favorite_border, 'Favorites', () => context.push('/favorites')),
          _tile(context, Icons.notifications_outlined, 'Notifications', () => context.push('/notifications')),
          _tile(context, Icons.settings_outlined, 'Settings', () => context.push('/settings')),
          const Divider(height: 32),
          _tile(
            context,
            Icons.logout,
            'Logout',
            () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
            color: Colors.redAccent,
          ),
        ],
      ),
    );
  }

  Widget _tile(BuildContext context, IconData icon, String label, VoidCallback onTap, {Color? color}) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(label, style: TextStyle(color: color)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}
