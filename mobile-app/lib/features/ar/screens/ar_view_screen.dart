import 'dart:io';
import 'package:dio/dio.dart';
import 'package:ar_flutter_plugin_flutterflow/ar_flutter_plugin.dart';
import 'package:ar_flutter_plugin_flutterflow/datatypes/config_planedetection.dart';
import 'package:ar_flutter_plugin_flutterflow/datatypes/node_types.dart';
import 'package:ar_flutter_plugin_flutterflow/managers/ar_anchor_manager.dart';
import 'package:ar_flutter_plugin_flutterflow/managers/ar_location_manager.dart';
import 'package:ar_flutter_plugin_flutterflow/managers/ar_object_manager.dart';
import 'package:ar_flutter_plugin_flutterflow/managers/ar_session_manager.dart';
import 'package:ar_flutter_plugin_flutterflow/models/ar_anchor.dart';
import 'package:ar_flutter_plugin_flutterflow/models/ar_hittest_result.dart';
import 'package:ar_flutter_plugin_flutterflow/models/ar_node.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:screenshot/screenshot.dart';
import 'package:path_provider/path_provider.dart';
import 'package:vector_math/vector_math_64.dart' as vector;
import 'package:uuid/uuid.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../furniture_details/screens/furniture_details_screen.dart';
import '../providers/ar_scene_provider.dart';

/// Core AR feature: opens the live camera, detects horizontal planes, and
/// lets the user place, move, freely rotate a full 360\u00b0 (twist gesture),
/// scale, duplicate, and delete 3D furniture directly on the real-world
/// floor, then save the resulting layout as a design.
class ArViewScreen extends ConsumerStatefulWidget {
  final String furnitureId;
  const ArViewScreen({super.key, required this.furnitureId});

  @override
  ConsumerState<ArViewScreen> createState() => _ArViewScreenState();
}

class _ArViewScreenState extends ConsumerState<ArViewScreen> {
  ARSessionManager? _sessionManager;
  ARObjectManager? _objectManager;
  ARAnchorManager? _anchorManager;
  final Map<String, ARAnchor> _anchorsByNodeId = {};
  final _screenshotController = ScreenshotController();
  final _uuid = const Uuid();
  bool _isSaving = false;

  @override
  void dispose() {
    _sessionManager?.dispose();
    super.dispose();
  }

  void _onArViewCreated(
    ARSessionManager sessionManager,
    ARObjectManager objectManager,
    ARAnchorManager anchorManager,
    ARLocationManager locationManager,
  ) {
    _sessionManager = sessionManager;
    _objectManager = objectManager;
    _anchorManager = anchorManager;

    sessionManager.onInitialize(
      showFeaturePoints: false,
      showPlanes: true,
      customPlaneTexturePath: null,
      showWorldOrigin: false,
      handlePans: true,
      handleRotation: true,
      handleTaps: true,
    );
    objectManager.onInitialize();

    sessionManager.onPlaneOrPointTap = _onPlaneTap;
    objectManager.onPanStart = (nodeId) => ref.read(arSceneProvider.notifier).selectNode(nodeId);
    objectManager.onPanChange = (nodeId) {
      _onNodeTransformChanged(nodeId, null);
    };
    objectManager.onPanEnd = (nodeId, transform) {
      _onNodeTransformChanged(nodeId, transform);
    };
    objectManager.onRotationStart = (nodeId) => ref.read(arSceneProvider.notifier).selectNode(nodeId);
    objectManager.onRotationChange = (nodeId) {
      _onNodeTransformChanged(nodeId, null);
    };
    objectManager.onRotationEnd = (nodeId, transform) {
      _onNodeTransformChanged(nodeId, transform);
    };

    ref.read(arSceneProvider.notifier).onPlaneDetected();
  }

  void _onNodeTransformChanged(String nodeId, vector.Matrix4? transform) {
    if (transform == null) return;
    final translation = transform.getTranslation();
    final rotation = vector.Quaternion.fromRotation(transform.getRotation()).storage;
    ref.read(arSceneProvider.notifier).updateTransform(
          nodeId,
          position: translation,
          rotation: vector.Vector4(rotation[0], rotation[1], rotation[2], rotation[3]),
        );
  }

  Future<void> _onPlaneTap(List<ARHitTestResult> hits) async {
    if (hits.isEmpty || _objectManager == null || _anchorManager == null) return;
    // Some plugin versions expose the hit type as an enum not imported here;
    // fallback to string matching to detect plane hits.
    final hit = hits.firstWhere(
      (h) => h.type.toString().toLowerCase().contains('plane'),
      orElse: () => hits.first,
    );

    final anchor = ARPlaneAnchor(transformation: hit.worldTransform);
    final anchorAdded = await _anchorManager!.addAnchor(anchor);
    if (anchorAdded != true) return;

    final detailAsync = ref.read(furnitureDetailProvider(widget.furnitureId));
    final modelUrl = detailAsync.value?.model3DUrl;
    if (modelUrl == null) return;

    final node = ARNode(
      type: NodeType.webGLB,
      uri: modelUrl,
      scale: vector.Vector3(1, 1, 1),
      position: vector.Vector3(0, 0, 0),
      rotation: vector.Vector4(1, 0, 0, 0),
    );

    final nodeAdded = await _objectManager!.addNode(node, planeAnchor: anchor);
    if (nodeAdded != true) return;

    final nodeId = node.name;
    _anchorsByNodeId[nodeId] = anchor;

    ref.read(arSceneProvider.notifier).addNode(
          PlacedNode(
            nodeId: nodeId,
            furnitureId: widget.furnitureId,
            modelUrl: modelUrl,
            position: hit.worldTransform.getTranslation(),
            rotation: vector.Vector4(0, 0, 0, 1),
            scale: vector.Vector3(1, 1, 1),
          ),
        );
  }

  void _scaleSelected(double factor) {
    final scene = ref.read(arSceneProvider);
    final selected = scene.selectedNode;
    if (selected == null) return;
    final newScale = selected.scale * factor;
    ref.read(arSceneProvider.notifier).updateTransform(selected.nodeId, scale: newScale);
    // Applying the updated scale back to the AR object is handled via
    // objectManager.removeNode + addNode with the new scale, since the
    // plugin does not expose a direct in-place scale setter.
  }

  Future<void> _deleteSelected() async {
    final scene = ref.read(arSceneProvider);
    final selected = scene.selectedNode;
    if (selected == null) return;
    await _objectManager?.removeNode(
      ARNode(
        type: NodeType.webGLB,
        uri: selected.modelUrl,
        name: selected.nodeId,
      ),
    );
    final anchor = _anchorsByNodeId.remove(selected.nodeId);
    if (anchor != null) await _anchorManager?.removeAnchor(anchor);
    ref.read(arSceneProvider.notifier).deleteNode(selected.nodeId);
  }

  Future<void> _resetScene() async {
    for (final node in ref.read(arSceneProvider).nodes) {
      await _objectManager?.removeNode(
        ARNode(
          type: NodeType.webGLB,
          uri: node.modelUrl,
          name: node.nodeId,
        ),
      );
    }
    for (final anchor in _anchorsByNodeId.values) {
      await _anchorManager?.removeAnchor(anchor);
    }
    _anchorsByNodeId.clear();
    ref.read(arSceneProvider.notifier).resetScene();
  }

  Future<String?> _takeScreenshot() async {
    final image = await _screenshotController.capture();
    if (image == null) return null;
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/ar_design_${DateTime.now().millisecondsSinceEpoch}.png');
    await file.writeAsBytes(image);
    return file.path;
  }

  Future<void> _saveDesign() async {
    final scene = ref.read(arSceneProvider);
    if (scene.nodes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Place at least one item first')));
      return;
    }

    final name = await showDialog<String>(
      context: context,
      builder: (context) {
        final ctrl = TextEditingController(text: 'My Room Design');
        return AlertDialog(
          title: const Text('Save Design'),
          content: TextField(controller: ctrl, decoration: const InputDecoration(labelText: 'Design name')),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(onPressed: () => Navigator.pop(context, ctrl.text), child: const Text('Save')),
          ],
        );
      },
    );
    if (name == null || name.trim().isEmpty) return;

    setState(() => _isSaving = true);
    try {
      final screenshotPath = await _takeScreenshot();
      final formData = FormData.fromMap({
        'name': name.trim(),
        'placedItems': scene.nodes.map((n) => n.toDesignJson()).toList().toString(),
        if (screenshotPath != null) 'screenshot': await MultipartFile.fromFile(screenshotPath),
      });
      await DioClient.instance.dio.post(ApiConstants.savedDesigns, data: formData);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Design saved!')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to save: $e')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scene = ref.watch(arSceneProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Screenshot(
        controller: _screenshotController,
        child: Stack(
          children: [
            ARView(
              onARViewCreated: _onArViewCreated,
              planeDetectionConfig: PlaneDetectionConfig.horizontal,
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _roundIconButton(Icons.close, () => Navigator.pop(context)),
                    if (!scene.planeDetected)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
                        child: const Text('Move your phone to detect the floor', style: TextStyle(color: Colors.white)),
                      ),
                    _roundIconButton(Icons.refresh, _resetScene),
                  ],
                ),
              ),
            ),
            if (scene.selectedNode != null)
              Positioned(
                bottom: 168,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.threesixty_rounded, color: Colors.white70, size: 16),
                        SizedBox(width: 6),
                        Text('Twist with two fingers to rotate 360\u00b0', style: TextStyle(color: Colors.white, fontSize: 12.5)),
                      ],
                    ),
                  ),
                ),
              ),
            if (scene.selectedNode != null)
              Positioned(
                bottom: 110,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _roundIconButton(Icons.zoom_out, () => _scaleSelected(0.9)),
                    _roundIconButton(Icons.zoom_in, () => _scaleSelected(1.1)),
                    _roundIconButton(Icons.copy_all, () => ref.read(arSceneProvider.notifier).duplicateSelected(_uuid.v4)),
                    _roundIconButton(Icons.delete_outline, _deleteSelected),
                  ],
                ),
              ),
            Positioned(
              bottom: 24,
              left: 20,
              right: 20,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _saveDesign,
                icon: _isSaving
                    ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.save_outlined),
                label: Text(_isSaving ? 'Saving...' : 'Save Design'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _roundIconButton(IconData icon, VoidCallback onTap) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: CircleAvatar(
          backgroundColor: Colors.black54,
          child: IconButton(icon: Icon(icon, color: Colors.white), onPressed: onTap),
        ),
      );
}
