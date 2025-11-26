package vn.huy.controller.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BillDetailResponse {
    private Long serviceId;
    private String serviceName;
    private Integer quantity;
    private BigDecimal price;
}
