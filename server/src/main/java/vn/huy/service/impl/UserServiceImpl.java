package vn.huy.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.huy.common.UserStatus;
import vn.huy.controller.request.RoleRequest;
import vn.huy.controller.request.UserRequest;
import vn.huy.controller.response.UserResponse;
import vn.huy.exception.ResourceNotFoundException;
import vn.huy.model.Role;
import vn.huy.model.User;
import vn.huy.repository.RoleRepository;
import vn.huy.repository.UserRepository;
import vn.huy.service.UserService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::mapToResponse).toList();
    }

    @Override
    public UserResponse createUser(UserRequest request) {
        // Check trùng lặp
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (request.getIdentityCard() != null && userRepository.existsByIdentityCard(request.getIdentityCard())) {
            throw new RuntimeException("IdentityCard already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setIdentityCard(request.getIdentityCard());
        user.setGender(request.getGender());
        user.setCity(request.getCity());
        user.setCountry(request.getCountry());
        user.setAddress(request.getAddress());
        user.setDescription(request.getDescription());
        
        user.setRole(getRole(request.getRoleId()));
        user.setStatus(UserStatus.Active);
        
        // Set thời gian tạo
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    // --- HÀM TẠO NHÂN VIÊN (MỚI THÊM) ---
   // --- HÀM TẠO NHÂN VIÊN (ĐÃ SỬA GÁN ROLE ID = 3) ---
    @Override
    public User createEmployee(UserRequest request) { 
        // 1. Check trùng (Giữ nguyên)
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        
        // Các trường mặc định
       user.setGender(request.getGender());
        user.setIdentityCard("000000000"); 
        user.setCity("Hanoi");
        user.setCountry("Vietnam");
        user.setStatus(UserStatus.Active);
        user.setCreatedAt(LocalDateTime.now());

        Role staffRole = roleRepository.findById(3L)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Role có ID = 3 trong Database. Hãy kiểm tra lại bảng Role!"));
        
        user.setRole(staffRole); // Gán role vào user

        // 3. Lưu vào bảng User
        return userRepository.save(user);
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role addRole(RoleRequest role) {
        Role role1 = new Role();
        role1.setName(role.getName());
        role1.setDescription(role.getDescription());
        roleRepository.save(role1);
        return role1;
    }

    @Override
    public Role deleteRole(Long id) {
        Role role = getRole(id);
        roleRepository.delete(role);
        return role;
    }

    @Override
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToResponse(user);
    }

    private Role getRole(Long roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role Not Found"));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .identityCard(user.getIdentityCard())
                .gender(user.getGender())
                .city(user.getCity())
                .country(user.getCountry())
                .address(user.getAddress())
                .description(user.getDescription())
                .roleName(user.getRole().getName())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : LocalDateTime.now().toString())
                .build();
    }
}