plugins {
    id("com.android.application") version "9.3.3"
    id("org.jetbrains.kotlin.plugin.compose") version "2.2.10"
}

android {
    namespace = "es.polyforge.android"
    compileSdk {
        version = release(36) {
            minorApiLevel = 1
        }
    }

    defaultConfig {
        applicationId = "es.polyforge.android"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
        val apiUrl = providers.gradleProperty("polyforgeApiUrl")
            .orElse("http://10.0.2.2:8080/api").get()
        buildConfigField("String", "API_URL", "\"$apiUrl\"")
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2026.02.01"))
    implementation("androidx.activity:activity-compose:1.8.0")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.1")
}
