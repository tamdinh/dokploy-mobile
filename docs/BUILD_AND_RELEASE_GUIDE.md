# Hướng dẫn Build & Phát hành Dokploy Mobile (Expo EAS & GitHub Actions)

Tài liệu này hướng dẫn cấu trúc và quy trình build tự động cho Dokploy Mobile trên Android và iOS, được đồng bộ hóa và chuẩn hóa tương tự như kiến trúc của dự án `clario`.

---

## 1. Cấu hình Package Manager (`pnpm`)
Dự án đã được đồng bộ chuẩn `pnpm` (pnpm v12) với `.npmrc` và `pnpm-workspace.yaml`:
- **`node-linker=hoisted`**: Đảm bảo Metro, Babel, và Android Gradle autolinking tìm thấy các module phụ thuộc trực tiếp từ thư mục gốc, tránh lỗi thiếu module do mô hình symlink cô lập của pnpm.
- **`allowBuilds`**: Cho phép chạy an toàn các build scripts (`@firebase/util`, `protobufjs`).

### Cài đặt dependencies:
```bash
pnpm install --frozen-lockfile
```

---

## 2. Cấu hình EAS Build (`eas.json`)

File `eas.json` định nghĩa các profiles tương tự `clario`:

| Profile | Nền tảng | Định dạng | Mục đích | Channel |
|---|---|---|---|---|
| `development` | Android / iOS | APK / Dev Client | Dùng cho dev testing trên thiết bị thật | `development` |
| `preview` | Android | APK (`buildType: "apk"`) | Cài đặt trực tiếp file APK để test nội bộ (Ad-hoc) | `preview` |
| `preview` | iOS | Ad-hoc / TestFlight | Test nội bộ qua EAS Internal Distribution | `preview` |
| `production` | Android | AAB (`app-bundle`) | Bản phát hành chính thức lên Google Play Store | `production` |
| `production` | iOS | Store Archive (`.ipa`) | Bản phát hành chính thức lên Apple App Store / TestFlight | `production` |
| `sim-prod` | iOS | Simulator build | Test bản production trực tiếp trên iOS Simulator | `production` |

---

## 3. Các Config Plugins Tối Ưu Native Build (`plugins/`)

Các plugin tuỳ biến đã được tích hợp vào `app.config.js`:
- **`with-disable-android-lint.js`**: Tắt `lintVitalAnalyzeRelease` trong AGP để chống lỗi `OutOfMemoryError` (OOM) khi build bản release trên runner CI hoặc self-hosted.
- **`with-large-heap.js`**: Kích hoạt `android:largeHeap="true"` trong `AndroidManifest.xml`.
- **`with-preview-debuggable.js`**: Đảm bảo APK preview có cờ debuggable nếu cần thiết cho test environment.
- **`with-android-ndk-version.js`**: Đồng bộ NDK version giữa các native libraries.
- **`with-fmt-consteval-fix.js`**: Sửa lỗi Apple Clang consteval trên iOS.
- **`with-rn-firebase-ios.js`**: Cấu hình static framework cho Firebase iOS.
- **`with-ios-sdkroot-auto.js`**: Đồng bộ SDKROOT cho Xcode project.

---

## 4. Hệ Thống GitHub Actions Workflows

Các workflows nằm trong thư mục `.github/workflows/`:

### 1. `android-build.yml` (Manual Build APK)
- **Kích hoạt**: Bấm nút **Run workflow** trên GitHub (`workflow_dispatch`).
- **Input**:
  - `profile`: `preview` (mặc định), `development`, hoặc `both`.
- **Runner**: Tận dụng self-hosted runner `[self-hosted, expo-android-runner]` (tương tự như `clario`), build cực nhanh và tải trực tiếp file `.apk` vào Artifacts (lưu trữ 14 ngày).

### 2. `android-production.yml` (Automated Production Release)
- **Kích hoạt**: Khi push git tag dạng `v*.*.*` (hoặc chạy thủ công qua `workflow_dispatch`).
- **Runner**: `[self-hosted, expo-android-runner]`.
- **Đầu ra**:
  - Build bản `dokploy-<version>.aab` chuẩn production.
  - Tự động tạo GitHub Release và đính kèm file AAB vào Release.

### 3. `ios-build.yml` (EAS Cloud iOS Build)
- **Kích hoạt**: Chạy thủ công qua `workflow_dispatch`.
- **Input**:
  - `profile`: `preview`, `development`, `production`, hoặc `sim-prod`.
  - `submit`: Tuỳ chọn tự động submit lên TestFlight / App Store nếu là production.
- **Runner**: `ubuntu-latest` điều phối EAS Cloud build qua Expo infrastructure.

### 4. `ios-production.yml` (Automated iOS Release)
- **Kích hoạt**: Khi push git tag dạng `v*.*.*`.
- **Runner**: `ubuntu-latest`.
- **Đầu ra**: Kích hoạt EAS Cloud build production cho iOS và tự động submit lên App Store / TestFlight.

### 5. `ci.yml` (Code Quality Gate)
- **Kích hoạt**: Trên mọi commit push lên `main` hoặc Pull Request.
- **Kiểm tra**:
  - `pnpm typecheck` (`tsc --noEmit`).
  - `pnpm format:check` (`prettier --check .`).

### 6. `pr-title.yml` (Conventional Commits)
- Kiểm tra tiêu đề PR theo chuẩn Conventional Commits (`feat:`, `fix:`, `chore:`, ...).

---

## 5. Secrets Cần Thiết Trên GitHub Repository

Để các workflow hoạt động trơn tru, cấu hình trong **Settings > Secrets and variables > Actions**:

| Secret Key | Mục đích | Bắt buộc cho |
|---|---|---|
| `EXPO_TOKEN` | Token xác thực tài khoản Expo / EAS CLI | Tất cả build Android & iOS |
| `GH_TOKEN` | Tạo GitHub Release (Mặc định GitHub tự cấp qua `${{ github.token }}`) | `android-production.yml` |
