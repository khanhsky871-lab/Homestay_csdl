package vn.huy.controller.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceCreationRequest {

    @NotBlank(message = "Room name is required")
    private String name;

    @NotNull(message = "Group id is required")
    private Long groupId;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "unitPrice must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "unitPrice format is invalid")
    private BigDecimal unitPrice;

    @NotNull(message = "isActive is required")
    private Boolean isActive;

    @NotBlank(message = "description is required")
    private String description;
}
