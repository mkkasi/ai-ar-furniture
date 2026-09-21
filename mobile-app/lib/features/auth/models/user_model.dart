class UserModel {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final String role;
  final bool isEmailVerified;
  final bool darkModePref;
  final String language;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatarUrl,
    this.role = 'user',
    this.isEmailVerified = false,
    this.darkModePref = false,
    this.language = 'en',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final preferences = json['preferences'] as Map<String, dynamic>?;
    return UserModel(
      id: json['id'] ?? json['_id'],
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      avatarUrl: json['avatar'] is Map ? json['avatar']['url'] : null,
      role: json['role'] ?? 'user',
      isEmailVerified: json['isEmailVerified'] ?? false,
      darkModePref: preferences?['darkMode'] ?? false,
      language: preferences?['language'] ?? 'en',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'avatar': {'url': avatarUrl},
        'role': role,
        'isEmailVerified': isEmailVerified,
        'preferences': {'darkMode': darkModePref, 'language': language},
      };

  bool get isAdmin => role == 'admin';
}
