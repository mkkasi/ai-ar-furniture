import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/settings_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  static const _languages = {'en': 'English', 'es': 'Español', 'fr': 'Français', 'hi': 'हिन्दी'};

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(darkModeProvider);
    final language = ref.watch(languageProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          SwitchListTile(
            title: const Text('Dark Mode'),
            secondary: const Icon(Icons.dark_mode_outlined),
            value: isDark,
            onChanged: (v) => ref.read(darkModeProvider.notifier).toggle(v),
          ),
          ListTile(
            leading: const Icon(Icons.language_outlined),
            title: const Text('Language'),
            subtitle: Text(_languages[language] ?? 'English'),
            onTap: () => showModalBottomSheet(
              context: context,
              builder: (context) => Column(
                mainAxisSize: MainAxisSize.min,
                children: _languages.entries
                    .map((e) => ListTile(
                          title: Text(e.value),
                          trailing: language == e.key ? const Icon(Icons.check) : null,
                          onTap: () {
                            ref.read(languageProvider.notifier).setLanguage(e.key);
                            Navigator.pop(context);
                          },
                        ))
                    .toList(),
              ),
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Privacy Policy'),
            onTap: () => launchUrl(Uri.parse('https://arfurniturestudio.com/privacy')),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: const Text('Terms of Service'),
            onTap: () => launchUrl(Uri.parse('https://arfurniturestudio.com/terms')),
          ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('About'),
            onTap: () => showAboutDialog(
              context: context,
              applicationName: 'AR Furniture Studio',
              applicationVersion: '1.0.0',
            ),
          ),
        ],
      ),
    );
  }
}
