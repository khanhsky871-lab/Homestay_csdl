package vn.huy.controller.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceUpdateRequest {
    @NotBlank(message = "name is required")
    private String name;

    @NotNull(message = "groupId is required")
    private Long groupId;

    @NotNull(message = "unitPrice is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "unitPrice must be positive")
    private BigDecimal unitPrice;

    private Boolean isActive;
    private String description;
}
