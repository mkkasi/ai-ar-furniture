import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();

  Future<void> _submit() async {
    if (!_emailCtrl.text.contains('@')) return;
    final success = await ref.read(authProvider.notifier).forgotPassword(_emailCtrl.text.trim());
    if (!mounted) return;
    if (success) {
      context.push('/verify-otp', extra: {'email': _emailCtrl.text.trim(), 'purpose': 'password_reset'});
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
              Text('Reset password', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text("We'll send a verification code to your email", style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 24),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.mail_outline)),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: authState.isLoading ? null : _submit,
                child: authState.isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Send Code'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
