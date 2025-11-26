package vn.huy.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ServiceGroupCreationRequest {

    @NotBlank(message = "Group name is required")
    private String name;
}
