import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String resetToken;
  const ResetPasswordScreen({super.key, required this.resetToken});

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _passwordCtrl = TextEditingController();

  Future<void> _submit() async {
    if (_passwordCtrl.text.length < 8) return;
    final success = await ref
        .read(authProvider.notifier)
        .resetPassword(resetToken: widget.resetToken, newPassword: _passwordCtrl.text);
    if (!mounted) return;
    if (success) {
      context.go('/login');
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password reset. Please log in.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Set new password', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 24),
              TextField(
                controller: _passwordCtrl,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'New password', prefixIcon: Icon(Icons.lock_outline)),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: authState.isLoading ? null : _submit,
                child: authState.isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Reset Password'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
