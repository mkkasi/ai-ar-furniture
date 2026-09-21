import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _phoneCtrl;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    _nameCtrl = TextEditingController(text: user?.name);
    _phoneCtrl = TextEditingController(text: user?.phone);
  }

  Future<void> _save() async {
    final success = await ref.read(authProvider.notifier).updateProfile(name: _nameCtrl.text.trim(), phone: _phoneCtrl.text.trim());
    if (!mounted) return;
    if (success) {
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to update profile')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authProvider).isLoading;
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Full name')),
            const SizedBox(height: 16),
            TextField(controller: _phoneCtrl, decoration: const InputDecoration(labelText: 'Phone')),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: isLoading ? null : _save,
              child: isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }
}
