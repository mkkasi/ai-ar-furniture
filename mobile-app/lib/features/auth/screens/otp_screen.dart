import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

/// Shared OTP screen for both email verification and password-reset flows.
/// [purpose] is either 'email_verification' or 'password_reset'.
class OtpScreen extends ConsumerStatefulWidget {
  final String email;
  final String purpose;
  const OtpScreen({super.key, required this.email, required this.purpose});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otpCtrl = TextEditingController();
  Timer? _cooldownTimer;
  int _resendCooldown = 0;

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    _otpCtrl.dispose();
    super.dispose();
  }

  void _startCooldown() {
    setState(() => _resendCooldown = 30);
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_resendCooldown <= 1) {
        timer.cancel();
        setState(() => _resendCooldown = 0);
      } else {
        setState(() => _resendCooldown -= 1);
      }
    });
  }

  Future<void> _resend() async {
    final notifier = ref.read(authProvider.notifier);
    final ok = await notifier.resendOtp(email: widget.email, purpose: widget.purpose);
    if (!mounted) return;
    if (ok) {
      _startCooldown();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('A new code has been sent')));
    } else {
      final error = ref.read(authProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error ?? "Couldn't resend the code")));
    }
  }

  Future<void> _verify() async {
    if (_otpCtrl.text.trim().length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter the 6-digit code')));
      return;
    }

    final notifier = ref.read(authProvider.notifier);
    final success = await notifier.verifyOtp(email: widget.email, otp: _otpCtrl.text.trim(), purpose: widget.purpose);

    if (!mounted) return;
    if (success && widget.purpose == 'email_verification') {
      context.go('/login');
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Email verified! Please log in.')));
    } else if (success && widget.purpose == 'password_reset') {
      // The backend issues a short-lived resetToken alongside a successful
      // password_reset OTP verification; verifyOtp() stores it in
      // AuthState so it can be threaded through here to authorize the
      // actual password change on the next screen.
      final resetToken = ref.read(authProvider).resetToken;
      if (resetToken == null || resetToken.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification succeeded but no reset token was returned. Please try again.')),
        );
        return;
      }
      context.push('/reset-password', extra: {'email': widget.email, 'resetToken': resetToken});
    } else {
      final error = ref.read(authProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error ?? 'Invalid or expired code')));
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
              Text('Verify your email', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text('Enter the 6-digit code sent to ${widget.email}', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 4),
              Text('The code expires in 10 minutes.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey)),
              const SizedBox(height: 32),
              TextField(
                controller: _otpCtrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 28, letterSpacing: 12, fontWeight: FontWeight.bold),
                decoration: const InputDecoration(counterText: ''),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: authState.isLoading ? null : _verify,
                child: authState.isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Verify'),
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: (authState.isLoading || _resendCooldown > 0) ? null : _resend,
                  child: Text(_resendCooldown > 0 ? 'Resend code in ${_resendCooldown}s' : "Didn't get a code? Resend"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
