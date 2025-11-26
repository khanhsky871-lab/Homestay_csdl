package vn.huy.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationGuestResponse {
    private Long id;
    private String name;
    private String identityCard;
}
