package vn.huy.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateBillRequest {

    @NotNull(message = "reservationId is required")
    private Long reservationId;

    private BigDecimal total;
}
