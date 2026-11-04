package es.polyforge;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
@Configuration
class Security {
    @Bean BCryptPasswordEncoder encoder() { return new BCryptPasswordEncoder(); }

    @Bean SecurityFilterChain filter(HttpSecurity http, @Value("${polyforge.origin}") String origin) throws Exception {
        var cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of(origin));
        cors.setAllowCredentials(true);
        cors.setAllowedHeaders(List.of("Content-Type", "X-CSRF-TOKEN"));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return http.cors(c -> c.configurationSource(source))
            .authorizeHttpRequests(a -> a.anyRequest().permitAll()).build();
    }
}
