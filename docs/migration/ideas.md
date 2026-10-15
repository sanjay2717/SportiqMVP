# SportIQ Mobile Client: Migration Ideas & Future Roadmap

This document captures valuable ideas, architectural enhancements, and potential future features identified during the native mobile client migration that are out of scope for the current vertical slice.

---

## 1. Offline & Caching Architecture
- **TanStack Query (React Query) / WatermelonDB / MMKV:**
  - Introduce query caching and optimistic updates for social feeds, notifications, and profile details to support zero-latency browsing on weak 3G/4G connections in rural areas (e.g. Karur pilot region).
  - Persist cached feeds locally so users opening the app without connectivity immediately see their last loaded feed.

## 2. Push Notifications
- **FCM (Firebase Cloud Messaging) / OneSignal:**
  - Transition from in-app polling to push notifications for incoming direct messages, event invitations, follow requests, and tournament updates.
  - Supabase Database Webhook -> Edge Function -> FCM.

## 3. Native Device Hardware Integrations
- **Camera & Barcode / QR Code Scanner:**
  - Real-time tournament athlete check-in: Organisers scan participant digital ID QR codes generated in the athlete profile.
  - Instant certificate scanning / camera capture for athlete achievements upload.
- **Biometric Authentication:**
  - TouchID / FaceID (`react-native-biometrics` or `expo-local-authentication`) for rapid, secure login on shared or personal devices.

## 4. Performance & Media Optimizations
- **Client-Side Image Compression:**
  - Before uploading avatars or certificates to Supabase Storage, compress images on-device using native image manipulation (`react-native-image-resizer` or `react-native-compressor`) to save mobile bandwidth.
- **Video Highlights & Media Streaming:**
  - Video playout for athletic drills with adaptive streaming (HLS/DASH) for match footage.

## 5. Modern State Management Evolution
- **Zustand Store:**
  - As cross-screen state grows beyond authentication (e.g. active tournament drafts, messaging threads, cached network connections), migrate from React Context to lightweight Zustand stores to avoid unnecessary sub-tree re-renders.
