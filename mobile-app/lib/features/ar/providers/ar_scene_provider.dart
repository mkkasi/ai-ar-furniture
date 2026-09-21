import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:vector_math/vector_math_64.dart' as vector;

/// Represents one furniture model placed in the live AR scene.
class PlacedNode {
  final String nodeId; // ID returned by the AR plugin's addNode call
  final String furnitureId;
  final String modelUrl;
  vector.Vector3 position;
  vector.Vector4 rotation; // quaternion
  vector.Vector3 scale;

  PlacedNode({
    required this.nodeId,
    required this.furnitureId,
    required this.modelUrl,
    required this.position,
    required this.rotation,
    required this.scale,
  });

  Map<String, dynamic> toDesignJson() => {
        'furniture': furnitureId,
        'position': {'x': position.x, 'y': position.y, 'z': position.z},
        'rotation': {'x': rotation.x, 'y': rotation.y, 'z': rotation.z},
        'scale': {'x': scale.x, 'y': scale.y, 'z': scale.z},
      };
}

/// Holds the live state of everything placed in the current AR session:
/// which nodes exist, which is selected, and whether a plane has been found.
class ArSceneState {
  final List<PlacedNode> nodes;
  final String? selectedNodeId;
  final bool planeDetected;

  const ArSceneState({this.nodes = const [], this.selectedNodeId, this.planeDetected = false});

  ArSceneState copyWith({List<PlacedNode>? nodes, String? selectedNodeId, bool? planeDetected, bool clearSelection = false}) {
    return ArSceneState(
      nodes: nodes ?? this.nodes,
      selectedNodeId: clearSelection ? null : (selectedNodeId ?? this.selectedNodeId),
      planeDetected: planeDetected ?? this.planeDetected,
    );
  }

  PlacedNode? get selectedNode => nodes.where((n) => n.nodeId == selectedNodeId).firstOrNull;
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}

class ArSceneNotifier extends StateNotifier<ArSceneState> {
  ArSceneNotifier() : super(const ArSceneState());

  void onPlaneDetected() {
    if (!state.planeDetected) state = state.copyWith(planeDetected: true);
  }

  void addNode(PlacedNode node) {
    state = state.copyWith(nodes: [...state.nodes, node], selectedNodeId: node.nodeId);
  }

  void selectNode(String nodeId) => state = state.copyWith(selectedNodeId: nodeId);

  void clearSelection() => state = state.copyWith(clearSelection: true);

  void updateTransform(String nodeId, {vector.Vector3? position, vector.Vector4? rotation, vector.Vector3? scale}) {
    final updated = state.nodes.map((n) {
      if (n.nodeId != nodeId) return n;
      if (position != null) n.position = position;
      if (rotation != null) n.rotation = rotation;
      if (scale != null) n.scale = scale;
      return n;
    }).toList();
    state = state.copyWith(nodes: updated);
  }

  void duplicateSelected(String Function() newNodeIdGenerator) {
    final selected = state.selectedNode;
    if (selected == null) return;
    final duplicate = PlacedNode(
      nodeId: newNodeIdGenerator(),
      furnitureId: selected.furnitureId,
      modelUrl: selected.modelUrl,
      position: selected.position + vector.Vector3(0.15, 0, 0.15),
      rotation: selected.rotation.clone(),
      scale: selected.scale.clone(),
    );
    addNode(duplicate);
  }

  void deleteNode(String nodeId) {
    state = state.copyWith(
      nodes: state.nodes.where((n) => n.nodeId != nodeId).toList(),
      clearSelection: state.selectedNodeId == nodeId,
    );
  }

  void resetScene() => state = const ArSceneState(planeDetected: true);
}

final arSceneProvider = StateNotifierProvider.autoDispose<ArSceneNotifier, ArSceneState>((ref) => ArSceneNotifier());
