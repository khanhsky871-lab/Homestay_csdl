package vn.huy.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ServiceItemResponse {
    private Long id;
    private String name;
    private Integer quantity;
    private BigDecimal price;
}
