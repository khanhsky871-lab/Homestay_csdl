package vn.huy.controller.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import vn.huy.common.PaymentMethod;
import vn.huy.common.PaymentStatus;
import vn.huy.common.ReservationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class ReservationDetailResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long roomId;
    private String roomName;
    private LocalDateTime bookingDate;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Integer numGuests;
    private Integer nights;
    private BigDecimal roomPrice;
    private ReservationStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private BigDecimal total;
    private List<ServiceItemResponse> services;
    private List<ReservationGuestResponse> guests;
}
