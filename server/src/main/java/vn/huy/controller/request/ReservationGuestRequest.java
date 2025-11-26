package vn.huy.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReservationGuestRequest {
    @NotBlank
    private String name;

    private String identityCard;
}
