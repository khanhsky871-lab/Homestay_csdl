package vn.huy.controller.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vn.huy.common.PaymentMethod;

import java.time.LocalDateTime;

@Data
public class ReservationCreationRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Check-in date must not be null")
    @Future(message = "Check-in date must be in the future")
    private LocalDateTime checkInDate;

    @NotNull(message = "Check-out date must not be null")
    @Future(message = "Check-out date must be in the future")
    private LocalDateTime checkOutDate;

    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "There must be at least 1 guest")
    private Integer numGuests;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
