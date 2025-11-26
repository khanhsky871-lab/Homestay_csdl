package vn.huy.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import vn.huy.common.ReservationStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReservationStatusResponse {
    private Long id;
    private ReservationStatus status;
    private LocalDateTime updatedAt;
}