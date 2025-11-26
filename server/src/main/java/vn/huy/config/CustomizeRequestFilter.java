package vn.huy.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.huy.service.UserServiceDetail; // Hoặc đường dẫn đúng tới service user của bạn
import vn.huy.service.JwtService; // Sử dụng JwtService interface
import vn.huy.common.TokenType;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomizeRequestFilter extends OncePerRequestFilter {

    private final JwtService jwtService; // Sử dụng JwtService
    private final UserServiceDetail userServiceDetail;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy token từ header Authorization
        final String authHeader = request.getHeader("Authorization");
        log.info("Incoming request {} {} | Authorization present: {}", request.getMethod(), request.getRequestURI(), authHeader != null);
        final String jwtToken;
        final String userEmail;

        // Nếu không có token hoặc không bắt đầu bằng Bearer -> Bỏ qua
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Bearer token present or header missing");
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Cắt bỏ chữ "Bearer " để lấy token gốc
        jwtToken = authHeader.substring(7);
        
        // 3. Trích xuất email/username từ token
        try {
            // JwtService requires token type; ở đây dùng ACCESS_TOKEN
            log.debug("Attempting to extract username from token (masked): {}", jwtToken.length() > 10 ? jwtToken.substring(0, 10) + "..." : jwtToken);
            userEmail = jwtService.extractUsername(jwtToken, TokenType.ACCESS_TOKEN);
            log.info("Extracted username from token: {}", userEmail);
        } catch (Exception e) {
            // Nếu token lỗi thì log và cho qua luôn (để Security chặn sau)
            log.error("Failed to extract username from token", e);
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Nếu có email và chưa được xác thực trong Context
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Lấy thông tin user từ Database
            UserDetails userDetails = userServiceDetail.userDetailsService().loadUserByUsername(userEmail);

            // 5. Kiểm tra token có hợp lệ với user này không
            // JwtService.extractUsername(...) đã throw nếu token không hợp lệ.
            // Tiếp theo kiểm tra subject khớp userDetails
            if (userEmail.equals(userDetails.getUsername())) {
                
                // Tạo đối tượng xác thực (Authentication Token)
                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                
                token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 6. Lưu user vào SecurityContext -> Hết lỗi NULL user
                securityContext.setAuthentication(token);
                SecurityContextHolder.setContext(securityContext);
            }
        }

        // Cho request đi tiếp
        try {
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            log.error("Exception during filterChain.doFilter", ex);
            throw ex;
        }
    }
}