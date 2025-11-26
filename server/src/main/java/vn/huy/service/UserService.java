package vn.huy.service;

import vn.huy.controller.request.RoleRequest;
import vn.huy.controller.request.UserRequest;
import vn.huy.controller.response.UserResponse;
import vn.huy.model.Role;

import java.util.List;

public interface UserService {
    vn.huy.model.User createEmployee(vn.huy.controller.request.UserRequest request);
    UserResponse getMyInfo();

    List<UserResponse> getAllUsers();

    UserResponse createUser(UserRequest request);

    List<Role> getAllRoles();

    Role addRole(RoleRequest role);

    Role deleteRole(Long id);
}
