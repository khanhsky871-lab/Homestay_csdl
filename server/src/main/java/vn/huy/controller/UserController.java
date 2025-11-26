package vn.huy.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.huy.controller.request.RoleRequest;
import vn.huy.controller.request.UserRequest;
import vn.huy.controller.response.ApiResponse;
import vn.huy.controller.response.UserResponse;
import vn.huy.model.Role;
import vn.huy.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
@Slf4j(topic = "USER")
@RequiredArgsConstructor
@Tag(name = "User management")
@CrossOrigin(origins = "http://localhost:8081")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get my profile")
    @GetMapping("/my-info")
public ResponseEntity<ApiResponse<UserResponse>> getMyInfo() {
    return ResponseEntity.ok(ApiResponse.success("Get profile success", userService.getMyInfo()));
}
    @Operation(summary = "Get all users (admin)")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('Admin')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(
                ApiResponse.success("List of users", users)
        );
    }

    @Operation(summary = "Create new user (admin)")
    @PostMapping

    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserRequest request
    ) {
        UserResponse response = userService.createUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User has been created", response));
    }

    @Operation(summary = "List of roles (admin)")
    @GetMapping("/roles")
    @PreAuthorize("hasAnyAuthority('Admin')")
    public ResponseEntity<ApiResponse<List<Role>>> getRoles() {
        List<Role> roles = userService.getAllRoles();
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("List of roles", roles));
    }

    @Operation(summary = "Add role (admin)")
    @PostMapping("/roles")
    @PreAuthorize("hasAnyAuthority('Admin')")
    public ResponseEntity<ApiResponse<Role>> addRole(@Valid @RequestBody RoleRequest role) {
        Role role1 = userService.addRole(role);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role has been added", role1));
    }

    @Operation(summary = "Delete role (admin)")
    @DeleteMapping("/{id}/roles")
    @PreAuthorize("hasAnyAuthority('Admin')")
    public ResponseEntity<ApiResponse<Role>> deleteRole(@PathVariable Long id) {
        Role role = userService.deleteRole(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("User has been deleted", role));
    }
    @io.swagger.v3.oas.annotations.Operation(summary = "Create new employee (Admin only)")
    @PostMapping("/employee")
    @PreAuthorize("hasAnyAuthority('Admin')") // Chỉ Admin được tạo
    public ResponseEntity<ApiResponse<Void>> createEmployee(@RequestBody @Valid vn.huy.controller.request.UserRequest request) {
        // Gọi service tạo nhân viên
        userService.createEmployee(request);
        
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản nhân viên thành công!", null));
    }
}
