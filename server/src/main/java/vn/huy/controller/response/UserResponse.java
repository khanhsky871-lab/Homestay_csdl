package vn.huy.controller.response;

import lombok.Builder;
import lombok.Data;
import vn.huy.common.Gender;
import vn.huy.common.UserStatus;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String identityCard;
    private Gender gender;
    private String city;
    private String country;
    private String address;
    private String description;
    private String roleName;
    private UserStatus status;
    private String createdAt;
}