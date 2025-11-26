package vn.huy.service;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Cho phép truy cập vào mọi API
                .allowedOrigins("http://localhost:8081") // Cho phép Frontend chạy ở port 8081 gọi vào
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các thao tác này
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}