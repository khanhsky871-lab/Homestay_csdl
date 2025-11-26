package vn.huy.controller.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RoomResponse {
    private Long id;
    private String type;
    private String name;
    private String status;
    private BigDecimal price;
    private Integer capacity;
    private String description;
    private Integer area;
    private List<String> images;
    private LocalDateTime createdAt;
}
