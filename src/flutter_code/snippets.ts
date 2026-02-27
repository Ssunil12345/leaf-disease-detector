export const FLUTTER_SNIPPETS = {
  pubspec: `name: leaf_disease_detector
description: Offline Leaf Disease Detection App
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  tflite_flutter: ^0.10.0
  image: ^4.0.17
  image_picker: ^1.0.4
  path_provider: ^2.1.1
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  provider: ^6.0.5
  intl: ^0.18.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  hive_generator: ^2.0.1
  build_runner: ^2.4.6

flutter:
  uses-material-design: true
  assets:
    - assets/models/leaf_model_quant.tflite
    - assets/labels.txt
    - assets/pesticides.json`,

  tfliteService: `import 'dart:io';
import 'dart:typed_data';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';

class TFLiteService {
  Interpreter? _interpreter;
  List<String>? _labels;

  // Singleton pattern
  static final TFLiteService _instance = TFLiteService._internal();
  factory TFLiteService() => _instance;
  TFLiteService._internal();

  Future<void> loadModel() async {
    try {
      // Load quantized INT8 model
      _interpreter = await Interpreter.fromAsset('assets/models/leaf_model_quant.tflite');
      // Load labels
      final labelData = await File('assets/labels.txt').readAsLines();
      _labels = labelData;
      print("Model loaded successfully");
    } catch (e) {
      print("Error loading model: $e");
    }
  }

  Future<Map<String, dynamic>> runInference(File imageFile) async {
    if (_interpreter == null) await loadModel();

    // 1. Preprocess Image
    final rawImage = img.decodeImage(await imageFile.readAsBytes());
    if (rawImage == null) throw Exception("Invalid Image");

    // Resize to 224x224
    final resizedImage = img.copyResize(rawImage, width: 224, height: 224);
    
    // Convert to Float32 and Normalize (0-1)
    var input = Float32List(1 * 224 * 224 * 3);
    var buffer = Float32List.view(input.buffer);
    int pixelIndex = 0;
    for (var y = 0; y < 224; y++) {
      for (var x = 0; x < 224; x++) {
        final pixel = resizedImage.getPixel(x, y);
        buffer[pixelIndex++] = pixel.r / 255.0;
        buffer[pixelIndex++] = pixel.g / 255.0;
        buffer[pixelIndex++] = pixel.b / 255.0;
      }
    }

    // 2. Prepare Output
    var output = Float32List(1 * _labels!.length).reshape([1, _labels!.length]);

    // 3. Run Inference
    _interpreter!.run(input.reshape([1, 224, 224, 3]), output);

    // 4. Process Results
    List<double> probabilities = List<double>.from(output[0]);
    double maxProb = 0.0;
    int maxIndex = 0;

    for (int i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        maxIndex = i;
      }
    }

    return {
      "label": _labels![maxIndex],
      "confidence": maxProb,
      "all_probs": probabilities
    };
  }

  void dispose() {
    _interpreter?.close();
  }
}`,

  hiveModel: `import 'package:hive/hive.dart';

part 'history_item.g.dart';

@HiveType(typeId: 0)
class HistoryItem extends HiveObject {
  @HiveField(0)
  final String imagePath;

  @HiveField(1)
  final String disease;

  @HiveField(2)
  final double confidence;

  @HiveField(3)
  final DateTime date;

  HistoryItem({
    required this.imagePath,
    required this.disease,
    required this.confidence,
    required this.date,
  });
}`,

  mainScreen: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/tflite_service.dart';
import '../services/history_service.dart';

class DetectionScreen extends StatefulWidget {
  @override
  _DetectionScreenState createState() => _DetectionScreenState();
}

class _DetectionScreenState extends State<DetectionScreen> {
  File? _image;
  Map<String, dynamic>? _result;
  bool _isLoading = false;

  Future<void> _processImage(File file) async {
    setState(() => _isLoading = true);
    try {
      final result = await TFLiteService().runInference(file);
      
      // Safety Threshold Logic
      if (result['confidence'] < 0.75) {
        _showUnknownDialog();
      } else {
        setState(() => _result = result);
        // Save to Hive
        Provider.of<HistoryService>(context, listen: false).addItem(
          HistoryItem(
            imagePath: file.path,
            disease: result['label'],
            confidence: result['confidence'],
            date: DateTime.now(),
          )
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showUnknownDialog() {
    showDialog(
      context: context,
      builder: (c) => AlertDialog(
        title: Text("Unknown Leaf"),
        content: Text("Confidence too low. Please capture a clearer image of the leaf."),
        actions: [TextButton(onPressed: () => Navigator.pop(c), child: Text("OK"))],
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("LeafScan Pro")),
      body: SingleChildScrollView(
        child: Column(
          children: [
            if (_image != null) Image.file(_image!),
            if (_isLoading) CircularProgressIndicator(),
            if (_result != null) ...[
              Text("Result: \${_result!['label']}"),
              Text("Confidence: \${(_result!['confidence'] * 100).toStringAsFixed(2)}%"),
            ],
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(onPressed: () => _pickImage(ImageSource.camera), child: Text("Camera")),
                ElevatedButton(onPressed: () => _pickImage(ImageSource.gallery), child: Text("Gallery")),
              ],
            )
          ],
        ),
      ),
    );
  }
}`
};
