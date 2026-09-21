import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../home/models/furniture_model.dart';
import '../../home/widgets/furniture_card.dart';
import '../models/room_design_result.dart';
import '../providers/interior_design_provider.dart';

class InteriorDesignScreen extends ConsumerStatefulWidget {
  const InteriorDesignScreen({super.key});

  @override
  ConsumerState<InteriorDesignScreen> createState() => _InteriorDesignScreenState();
}

class _InteriorDesignScreenState extends ConsumerState<InteriorDesignScreen> {
  File? _pickedPhoto;

  Future<void> _pickPhoto(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 85, maxWidth: 2000);
    if (picked == null) return;

    setState(() => _pickedPhoto = File(picked.path));
    if (!mounted) return;
    ref.read(interiorDesignProvider.notifier).analyzeRoom(File(picked.path));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(interiorDesignProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Interior Design'),
        actions: [
          if (state.result != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: 'Try another photo',
              onPressed: () {
                setState(() => _pickedPhoto = null);
                ref.read(interiorDesignProvider.notifier).reset();
              },
            ),
        ],
      ),
      body: SafeArea(
        child: _pickedPhoto == null
            ? _buildIntro(context)
            : _buildResult(context, state),
      ),
    );
  }

  Widget _buildIntro(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.auto_awesome_rounded, size: 56),
          const SizedBox(height: 16),
          Text(
            'Snap a photo of your room',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Our AI will detect the room\u2019s style and color palette, then '
            'recommend furniture and appliances \u2014 including a well-sized TV or '
            'AC \u2014 that fit the space.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => _pickPhoto(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: const Text('Take Photo'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _pickPhoto(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text('From Gallery'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResult(BuildContext context, InteriorDesignState state) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.file(_pickedPhoto!, height: 220, width: double.infinity, fit: BoxFit.cover),
        ),
        const SizedBox(height: 20),
        if (state.isAnalyzing)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Column(
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Analyzing your room...'),
              ],
            ),
          )
        else if (state.errorMessage != null)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Text(state.errorMessage!, style: const TextStyle(color: Colors.red)),
          )
        else if (state.result != null)
          _buildInsights(context, state.result!),
      ],
    );
  }

  Widget _buildInsights(BuildContext context, RoomDesignResult result) {
    final insights = result.insights;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (insights.detectedStyle != null) ...[
          Text('Detected Style', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(insights.detectedStyle!, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 16),
        ],
        if (insights.colorPalette.isNotEmpty) ...[
          Text('Suggested Color Palette', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Row(
            children: insights.colorPalette
                .map<Widget>((hex) => Padding(
                      padding: const EdgeInsets.only(right: 10),
                      child: CircleAvatar(
                        radius: 16,
                        backgroundColor: _parseHex(hex),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
        ],
        if (insights.layoutTips.isNotEmpty) ...[
          Text('Layout Tips', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          ...insights.layoutTips.map<Widget>((t) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [const Text('\u2022  '), Expanded(child: Text(t))],
                ),
              )),
          const SizedBox(height: 16),
        ],
        if (insights.suggestedTvSizeInches != null || insights.suggestedAcBtu != null) ...[
          Text('Appliance Sizing', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 10,
            children: [
              if (insights.suggestedTvSizeInches != null)
                Chip(avatar: const Icon(Icons.tv_rounded, size: 18), label: Text('${insights.suggestedTvSizeInches}" TV recommended')),
              if (insights.suggestedAcBtu != null)
                Chip(avatar: const Icon(Icons.ac_unit_rounded, size: 18), label: Text('${insights.suggestedAcBtu} BTU AC recommended')),
            ],
          ),
          const SizedBox(height: 16),
        ],
        if (result.recommendedFurniture.isNotEmpty) ...[
          Text('Recommended Furniture', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          _itemGrid(result.recommendedFurniture),
          const SizedBox(height: 16),
        ],
        if (result.recommendedAppliances.isNotEmpty) ...[
          Text('Recommended Appliances', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          _itemGrid(result.recommendedAppliances),
        ],
      ],
    );
  }

  Widget _itemGrid(List<FurnitureModel> items) {
    return SizedBox(
      height: 230,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, i) => SizedBox(width: 160, child: FurnitureCard(item: items[i])),
      ),
    );
  }

  Color _parseHex(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Colors.grey;
    }
  }
}
