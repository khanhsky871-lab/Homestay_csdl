package vn.huy.controller.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import vn.huy.common.RoomStatus;
import vn.huy.common.RoomType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class RoomUpdateRequest {

    private RoomType type;

    private String name;

    private RoomStatus status;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 1000, message = "Description too long")
    private String description;

    @Positive(message = "Area must be positive")
    private Integer area;

    private List<String> images = new ArrayList<>();
}
