# Hướng dẫn Build & Phát hành Dokploy Mobile (Expo EAS & GitHub Actions)

Tài liệu này hướng dẫn chi tiết chiến lược và quy trình build cho Dokploy Mobile:
- **Bản Internal Preview / Development (APK)**: Build nội bộ hoàn toàn miễn phí trên **GitHub Actions Self-Hosted Runner** qua `eas build --local` (tương tự như dự án `clario`), không tốn quota build cloud và tải file APK trực tiếp từ GitHub Artifacts.
- **Bản Production (Store Release - AAB & iOS Store IPA)**: Build chính thức trên **Expo EAS Cloud**, tự động ký mã với Keystore/Certificates và hỗ trợ submit trực tiếp lên Google Play Store và Apple App Store / TestFlight.

---

## 1. Chiến Lược Phân Chia Môi Trường Build

| Loại bản build | Nền tảng | Phương thức build | Runner | Nơi nhận kết quả |
|---|---|---|---|---|
| **Internal Preview** (`preview`) | Android | `eas build --local` | `[self-hosted, expo-android-runner]` | File `.apk` đính kèm trong **GitHub Actions Artifacts** (14 ngày) |
| **Development Client** (`development`) | Android | `eas build --local` | `[self-hosted, expo-android-runner]` | File `.apk` đính kèm trong **GitHub Actions Artifacts** |
| **Production Store** (`production`) | Android | `eas build` (EAS Cloud) | `ubuntu-latest` (EAS Cloud) | File `.aab` trên Expo Dashboard & tuỳ chọn đẩy lên Google Play |
| **Production Store** (`production`) | iOS | `eas build` (EAS Cloud) | `ubuntu-latest` (EAS Cloud) | Đẩy trực tiếp lên Apple TestFlight / App Store |
| **iOS Preview / Dev** | iOS | `eas build` (EAS Cloud) | `ubuntu-latest` (EAS Cloud) | Cài qua EAS Internal Distribution / TestFlight |

---

## 2. Hướng Dẫn Cấu Hình Self-Hosted Runner Cho `dokploy-mobile`

Do runner `expo-android-runner` hiện đang được gán riêng cho repo `tamdinh/clario`, bạn cần gán runner này (hoặc chạy thêm 1 runner container) cho repo `tamdinh/dokploy-mobile` theo một trong 2 cách sau:

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng - Dùng image của Tam Dinh)

Trên server/VPS đang chạy runner của bạn:

1. Lấy **Registration Token** từ GitHub:
   - Vào `https://github.com/tamdinh/dokploy-mobile/settings/actions/runners/new`
   - Sao chép giá trị token đăng ký (sau cờ `--token`).

2. Tạo thư mục hoặc file `docker-compose.runner-dokploy.yml`:
   ```yaml
   services:
     dokploy-mobile-runner:
       image: ghcr.io/tamdinh/docker-github-actions-runner-android:expo57-node22-android36-v1
       container_name: dokploy-mobile-runner
       restart: unless-stopped
       environment:
         REPO_URL: https://github.com/tamdinh/dokploy-mobile
         RUNNER_TOKEN: <YOUR_GITHUB_RUNNER_TOKEN> # Hoặc dùng ACCESS_TOKEN (GitHub PAT)
         RUNNER_NAME: expo-android-runner-dokploy
         RUNNER_LABELS: self-hosted,linux,x64,expo,android,web,vps,expo-android-runner
         RUNNER_WORKDIR: /runner/_work
         CONFIGURED_ACTIONS_RUNNER_FILES_DIR: /runner-data
         DISABLE_AUTOMATIC_DEREGISTRATION: "true"
         ANDROID_HOME: /usr/local/lib/android/sdk
         ANDROID_SDK_ROOT: /usr/local/lib/android/sdk
         ANDROID_NDK_HOME: /usr/local/lib/android/sdk/ndk/27.1.12297006
         JAVA_HOME: /usr/lib/jvm/temurin-17-jdk-amd64
       volumes:
         - dokploy-runner-data:/runner-data
         - gradle-cache:/root/.gradle
         - pnpm-cache:/root/.local/share/pnpm
         - expo-cache:/root/.expo

   volumes:
     dokploy-runner-data:
     gradle-cache:
       external: true # Tái sử dụng gradle cache chung với runner cũ để build siêu tốc
     pnpm-cache:
       external: true
     expo-cache:
       external: true
   ```

3. Khởi chạy runner:
   ```bash
   docker compose -f docker-compose.runner-dokploy.yml up -d
   ```

---

### Cách 2: Thêm Runner Trực Tiếp Bằng GitHub Actions Runner Binary

1. Trên máy chủ, tải và giải nén actions-runner:
   ```bash
   mkdir actions-runner-dokploy && cd actions-runner-dokploy
   curl -o actions-runner-linux-x64-2.337.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.337.0/actions-runner-linux-x64-2.337.0.tar.gz
   tar xzf ./actions-runner-linux-x64-2.337.0.tar.gz
   ```

2. Đăng ký runner với nhãn `expo-android-runner`:
   ```bash
   ./config.sh --url https://github.com/tamdinh/dokploy-mobile \
     --token <RUNNER_REGISTRATION_TOKEN> \
     --name expo-android-runner-dokploy \
     --labels self-hosted,Linux,X64,expo,android,web,vps,expo-android-runner \
     --work _work
   ```

3. Cài đặt và kích hoạt systemd service:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

---

## 3. Các Workflows GitHub Actions Hoạt Động Như Thế Nào?

### 1. `android-build.yml` (Internal Build - Self-hosted Runner)
- **Kích hoạt**: Bấm **Run workflow** trên tab Actions.
- **Input**:
  - `profile`: `preview` (mặc định), `development`, hoặc `both`.
- **Cơ chế**:
  - Chạy trên `[self-hosted, expo-android-runner]`.
  - Tận dụng Android SDK, NDK 27 và Gradle Cache cục bộ trên VPS.
  - Chạy `eas build --local --platform android --profile <profile> --non-interactive --output dokploy-<profile>.apk`.
  - Đính kèm file APK trực tiếp vào **Artifacts** để tải về cài đặt test ngay.

### 2. `android-production.yml` (Store Release - EAS Cloud)
- **Kích hoạt**: Tự động khi push tag `v*.*.*` hoặc chạy thủ công.
- **Cơ chế**:
  - Chạy trên `ubuntu-latest`.
  - Đẩy source code lên **Expo EAS Cloud**.
  - EAS Cloud ký mã với keystore production và build file `.aab` chuẩn Google Play.
  - Tự động tạo **GitHub Release** đính kèm số phiên bản.
  - Nếu tick chọn `auto_submit: true`, EAS sẽ tự động tải lên Google Play Console.

### 3. `ios-build.yml` & `ios-production.yml` (EAS Cloud)
- **Kích hoạt**: Manual hoặc push tag `v*.*.*`.
- **Cơ chế**:
  - Build bản iOS Archive trên hạ tầng macOS của EAS Cloud.
  - Hỗ trợ auto-submit trực tiếp vào Apple App Store / TestFlight.

### 4. `ci.yml` (Code Quality Gate)
- Kiểm tra `pnpm typecheck` (`tsc --noEmit`) và `pnpm format:check` trên mỗi Pull Request và commit vào `main`.

---

## 4. Quản Lý Secrets Trên GitHub Repository

Vào **Settings > Secrets and variables > Actions**:
- **`EXPO_TOKEN`**: *(Đã cấu hình)* Dùng để xác thực với Expo EAS API.
- **`GH_TOKEN`**: GitHub tự cấp quyền thông qua `${{ github.token }}` để tạo Release.
