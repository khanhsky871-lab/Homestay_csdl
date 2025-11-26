package vn.huy.service;

import lombok.RequiredArgsConstructor; // <-- Thêm cái này cho gọn code
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException; // <-- Nhớ import cái này
import org.springframework.stereotype.Service;
import vn.huy.repository.UserRepository;

@Service
@RequiredArgsConstructor // <-- Dùng cái này để tự tạo constructor cho userRepository
public class UserServiceDetail {

    private final UserRepository userRepository;

    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}