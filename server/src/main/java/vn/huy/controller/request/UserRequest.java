package vn.huy.controller.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import vn.huy.common.Gender;

@Getter
@Setter
public class UserRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;

    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9–11 digits")
    private String phone;

    @NotBlank(message = "Identity card is required")
    private String identityCard;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Country is required")
    private String country;

    @Size(max = 255, message = "Address must be less than 255 characters")
    private String address;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Role ID is required")
    private Long roleId;
}
