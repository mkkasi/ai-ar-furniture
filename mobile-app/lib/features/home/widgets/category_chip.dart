import 'package:flutter/material.dart';

class CategoryChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const CategoryChip({super.key, required this.label, required this.icon, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? theme.colorScheme.primary : theme.colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: selected ? theme.colorScheme.onPrimary : theme.colorScheme.onSurface),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(color: selected ? theme.colorScheme.onPrimary : theme.colorScheme.onSurface)),
          ],
        ),
      ),
    );
  }
}
