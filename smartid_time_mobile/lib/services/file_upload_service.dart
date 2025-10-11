import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:file_picker/file_picker.dart';

class FileUploadService extends ChangeNotifier {
  static const String apiBaseUrl = 'http://localhost:3003/api';
  
  bool _isUploading = false;
  String? _error;
  String? _uploadedFileUrl;
  
  // Getters
  bool get isUploading => _isUploading;
  String? get error => _error;
  String? get uploadedFileUrl => _uploadedFileUrl;
  
  // Upload file to server
  Future<String?> uploadFile({
    required String userId,
    String documentType = 'leave_support',
  }) async {
    try {
      _isUploading = true;
      _error = null;
      _uploadedFileUrl = null;
      notifyListeners();
      
      // Pick file using file_picker
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.any,
        allowMultiple: false,
        allowCompression: false,
      );
      
      if (result != null) {
        PlatformFile file = result.files.first;
        
        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          _error = 'File size exceeds 10MB limit';
          notifyListeners();
          return null;
        }
        
        // Create multipart request
        var request = http.MultipartRequest(
          'POST',
          Uri.parse('$apiBaseUrl/upload/documents'),
        );
        
        // Add headers
        request.headers['Origin'] = 'http://localhost:8080';
        
        // Add form fields
        request.fields['userId'] = userId;
        request.fields['documentType'] = documentType;
        
        // Add file
        if (kIsWeb) {
          // For web, use bytes
          if (file.bytes != null) {
            request.files.add(http.MultipartFile.fromBytes(
              'file',
              file.bytes!,
              filename: file.name,
            ));
          } else {
            _error = 'Unable to read file on web';
            notifyListeners();
            return null;
          }
        } else {
          // For mobile platforms, use path
          if (file.path != null) {
            request.files.add(await http.MultipartFile.fromPath(
              'file',
              file.path!,
              filename: file.name,
            ));
          } else {
            _error = 'Unable to read file path';
            notifyListeners();
            return null;
          }
        }
        
        print('📤 Uploading file: ${file.name} (${file.size} bytes)');
        
        // Send request
        var response = await request.send();
        var responseData = await response.stream.bytesToString();
        var jsonResponse = json.decode(responseData);
        
        print('📤 Upload response: ${response.statusCode}');
        print('📤 Upload data: $jsonResponse');
        
        if (response.statusCode == 200 && jsonResponse['success'] == true) {
          _uploadedFileUrl = jsonResponse['data']['fileUrl'];
          print('✅ File uploaded successfully: $_uploadedFileUrl');
          notifyListeners();
          return _uploadedFileUrl;
        } else {
          _error = jsonResponse['error'] ?? 'Upload failed';
          print('❌ Upload failed: $_error');
          notifyListeners();
          return null;
        }
      } else {
        // User cancelled file picking
        print('📤 File picking cancelled');
        return null;
      }
    } catch (e) {
      _error = 'Upload error: $e';
      print('❌ Upload error: $e');
      notifyListeners();
      return null;
    } finally {
      _isUploading = false;
      notifyListeners();
    }
  }
  
  // Clear state
  void clearState() {
    _isUploading = false;
    _error = null;
    _uploadedFileUrl = null;
    notifyListeners();
  }
  
  // Get file icon based on extension
  String getFileIcon(String? fileName) {
    if (fileName == null) return '📄';
    
    final extension = fileName.toLowerCase().split('.').last;
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📄';
    }
  }
  
  // Get file name from URL
  String getFileNameFromUrl(String url) {
    try {
      final uri = Uri.parse(url);
      final segments = uri.pathSegments;
      if (segments.isNotEmpty) {
        final fileName = segments.last;
        // Remove timestamp prefix if present
        final parts = fileName.split('_');
        if (parts.length > 1) {
          return parts.sublist(1).join('_');
        }
        return fileName;
      }
      return 'Document';
    } catch (e) {
      return 'Document';
    }
  }
  
  // Check if file type is supported
  bool isFileTypeSupported(String? fileName) {
    if (fileName == null) return false;
    
    final extension = fileName.toLowerCase().split('.').last;
    const supportedExtensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    return supportedExtensions.contains(extension);
  }
}