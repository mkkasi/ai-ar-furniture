import 'package:flutter/material.dart';
import 'package:model_viewer_plus/model_viewer_plus.dart';

/// A fast, no-camera-permission-needed 360° spin preview of a product's
/// 3D model — separate from the full-room AR placement flow (ArViewScreen).
/// Lets a shopper inspect an item from every angle before committing to
/// point the camera at their actual room.
class Product360ViewScreen extends StatelessWidget {
  final String modelUrl;
  final String itemName;

  const Product360ViewScreen({super.key, required this.modelUrl, required this.itemName});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(itemName, overflow: TextOverflow.ellipsis),
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: ModelViewer(
              src: modelUrl,
              alt: '360-degree view of $itemName',
              autoRotate: true,
              autoRotateDelay: 0,
              rotationPerSecond: '18deg',
              cameraControls: true,
              disableZoom: false,
              backgroundColor: Colors.black,
              loading: Loading.eager,
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 24,
            child: SafeArea(
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.threesixty_rounded, color: Colors.white70, size: 18),
                      SizedBox(width: 8),
                      Text('Drag to rotate \u00b7 pinch to zoom', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
