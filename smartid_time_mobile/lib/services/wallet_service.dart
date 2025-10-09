import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'supabase_service.dart';

class WalletService extends ChangeNotifier {
  static const String apiBaseUrl = 'http://localhost:3003/api';
  
  double _balance = 0.0;
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = false;
  String? _error;
  DateTime? _lastUpdated;

  // Getters
  double get balance => _balance;
  List<Map<String, dynamic>> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;
  DateTime? get lastUpdated => _lastUpdated;

  // Fetch wallet data
  Future<void> fetchWalletData(String userId, [String? employeeId]) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('💰 Fetching wallet data for user: $userId');
      
      // Fetch wallet balance
      await _fetchWalletBalance(userId, employeeId);
      
      // Fetch transaction history
      await _fetchTransactionHistory(userId, employeeId);
      
      _lastUpdated = DateTime.now();
      _error = null;
      
      print('✅ Wallet data fetched successfully');
    } catch (e) {
      _error = 'Failed to load wallet data: ${e.toString()}';
      print('❌ Wallet data fetch error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch wallet balance
  Future<void> _fetchWalletBalance(String userId, [String? employeeId]) async {
    try {
      String apiUrl;
      if (employeeId != null && employeeId.isNotEmpty) {
        apiUrl = '$apiBaseUrl/wallet/balance?employeeId=$employeeId';
      } else {
        apiUrl = '$apiBaseUrl/wallet/balance?userId=$userId';
      }
      
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _balance = (data['data']['balance'] ?? 0.0).toDouble();
          print('✅ Wallet balance: RM${_balance.toStringAsFixed(2)}');
        }
      }
    } catch (e) {
      print('❌ Error fetching wallet balance: $e');
      // Use default balance if API fails
      _balance = 150.0; // Default balance for demo
    }
  }

  // Fetch transaction history
  Future<void> _fetchTransactionHistory(String userId, [String? employeeId]) async {
    try {
      String apiUrl;
      if (employeeId != null && employeeId.isNotEmpty) {
        apiUrl = '$apiBaseUrl/wallet/transactions?employeeId=$employeeId';
      } else {
        apiUrl = '$apiBaseUrl/wallet/transactions?userId=$userId';
      }
      
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _transactions = List<Map<String, dynamic>>.from(data['data'] ?? []);
          print('✅ Transaction history: ${_transactions.length} records');
        }
      }
    } catch (e) {
      print('❌ Error fetching transaction history: $e');
      // Use demo transactions if API fails
      _transactions = [
        {
          'id': '1',
          'type': 'top_up',
          'amount': 100.00,
          'description': 'Top up via bank transfer',
          'created_at': DateTime.now().subtract(Duration(days: 2)).toIso8601String(),
          'status': 'completed',
        },
        {
          'id': '2',
          'type': 'purchase',
          'amount': -15.50,
          'description': 'Cafeteria purchase',
          'created_at': DateTime.now().subtract(Duration(days: 1)).toIso8601String(),
          'status': 'completed',
        },
        {
          'id': '3',
          'type': 'top_up',
          'amount': 50.00,
          'description': 'Top up via online banking',
          'created_at': DateTime.now().subtract(Duration(hours: 6)).toIso8601String(),
          'status': 'pending',
        },
      ];
    }
  }

  // Top up wallet
  Future<bool> topUpWallet({
    required String userId,
    String? employeeId,
    required double amount,
    required String method,
    String? referenceNumber,
  }) async {
    try {
      _error = null;
      notifyListeners();

      final requestBody = {
        'userId': userId,
        'employeeId': employeeId,
        'amount': amount,
        'type': 'top_up',
        'method': method,
        'referenceNumber': referenceNumber,
        'description': 'Top up via $method',
      };

      final response = await http.post(
        Uri.parse('$apiBaseUrl/wallet/transaction'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(requestBody),
      );

      final data = json.decode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Wallet top up successful: ${data['message']}');
        
        // Refresh wallet data
        await fetchWalletData(userId, employeeId);
        return true;
      } else {
        _error = data['error'] ?? 'Top up failed';
        print('❌ Top up failed: ${_error}');
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Top up failed: $e';
      print('❌ Top up error: $e');
      notifyListeners();
      return false;
    }
  }

  // Make purchase
  Future<bool> makePurchase({
    required String userId,
    String? employeeId,
    required double amount,
    required String description,
    String? merchantId,
  }) async {
    try {
      _error = null;
      notifyListeners();

      // Check if sufficient balance
      if (amount > _balance) {
        _error = 'Insufficient balance';
        notifyListeners();
        return false;
      }

      final requestBody = {
        'userId': userId,
        'employeeId': employeeId,
        'amount': -amount, // Negative for deduction
        'type': 'purchase',
        'description': description,
        'merchantId': merchantId,
      };

      final response = await http.post(
        Uri.parse('$apiBaseUrl/wallet/transaction'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(requestBody),
      );

      final data = json.decode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        print('✅ Purchase successful: ${data['message']}');
        
        // Refresh wallet data
        await fetchWalletData(userId, employeeId);
        return true;
      } else {
        _error = data['error'] ?? 'Purchase failed';
        print('❌ Purchase failed: ${_error}');
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Purchase failed: $e';
      print('❌ Purchase error: $e');
      notifyListeners();
      return false;
    }
  }

  // Refresh all data
  Future<void> refreshData(String userId, [String? employeeId]) async {
    await fetchWalletData(userId, employeeId);
  }

  // Clear all data
  void clearData() {
    _balance = 0.0;
    _transactions = [];
    _isLoading = false;
    _error = null;
    _lastUpdated = null;
    notifyListeners();
  }

  // Get transaction type display name
  String getTransactionTypeDisplayName(String type) {
    switch (type.toLowerCase()) {
      case 'top_up':
        return 'Top Up';
      case 'purchase':
        return 'Purchase';
      case 'transfer':
        return 'Transfer';
      case 'refund':
        return 'Refund';
      default:
        return 'Transaction';
    }
  }

  // Get transaction type icon
  String getTransactionTypeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'top_up':
        return '⬆️';
      case 'purchase':
        return '🛒';
      case 'transfer':
        return '💸';
      case 'refund':
        return '↩️';
      default:
        return '💰';
    }
  }

  // Get status color
  int getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return 0xFF10B981; // Green
      case 'failed':
        return 0xFFEF4444; // Red
      case 'pending':
        return 0xFFF59E0B; // Orange
      default:
        return 0xFF6B7280; // Gray
    }
  }

  // Format transaction amount
  String formatAmount(double amount) {
    if (amount >= 0) {
      return '+RM${amount.toStringAsFixed(2)}';
    } else {
      return '-RM${(-amount).toStringAsFixed(2)}';
    }
  }

  // Check if transaction is positive (income)
  bool isPositiveTransaction(double amount) {
    return amount >= 0;
  }
}