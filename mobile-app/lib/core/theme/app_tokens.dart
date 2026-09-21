/// Formalized spacing scale — matches the 4px-multiple rhythm already used
/// throughout the app (padding of 8/12/14/16/18/20/24 seen across screens),
/// collected here so new screens reach for a shared constant instead of a
/// one-off magic number.
class AppSpacing {
  AppSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;
}

/// Formalized corner-radius scale — matches the values already in use
/// (10/12/16/18/20/24), grouped by role so cards, chips, and sheets stay
/// visually consistent as new screens are added.
class AppRadii {
  AppRadii._();

  static const double chip = 10;
  static const double card = 16;
  static const double heroCard = 18;
  static const double sheet = 20;
  static const double pill = 24;
}
