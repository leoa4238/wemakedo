# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-05-22

### Added
- **My Page (`/mypage`):**
    - Dashboard with tabs for Hosted, Joined, and Liked gatherings.
    - User profile display.
- **Search & Filter:**
    - Global search bar for titles/content.
    - Category filtering (Sports, Study, Hobby, etc.).
    - Status filtering (Open/Closed).
- **Map View (`/gatherings/map`):**
    - Interactive map showing all gatherings.
    - User location tracking ("Locate Me" button).
    - Popups with gathering details and links.
- **Gathering Management:**
    - "Delete Gathering" feature for hosts.
    - Visual indicators for past/ended gatherings (Grayscale, Badges).

### Fixed
- **Build Error:** Resolved `next/dynamic` SSR issue in Map page by extracting client component.

## [0.1.0] - Initial MVP

### Added
- **Authentication:**
    - Supabase Auth integration (Email/Password).
    - Login/Signup pages with form validation.
- **Gatherings:**
    - Create gathering form with Daum Postcode integration.
    - Gathering list with "Near Me" sorting (Geolib).
    - Gathering detail page.
- **Community:**
    - Comment system (Add/Delete).
    - Like/Bookmark functionality.
- **Location:**
    - Latitude/Longitude storage in DB.
    - Distance calculation.
