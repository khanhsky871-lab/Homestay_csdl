package vn.huy.service;

import org.springframework.data.domain.Page;
import vn.huy.common.PaymentStatus;
import vn.huy.common.ReservationStatus;
import vn.huy.controller.request.AddServiceRequest;
import vn.huy.controller.request.ReservationCreationRequest;
import vn.huy.controller.request.ReservationGuestRequest;
import vn.huy.controller.response.*;
import vn.huy.model.UserPrincipal;

import java.util.List;


public interface ReservationService {

    ReservationResponse createReservation(Long userId, ReservationCreationRequest request);

    ReservationResponse updateReservation(Long id, ReservationCreationRequest request);

    ReservationResponse cancelReservation(Long id);

    Page<ReservationResponse> getReservationsPaginated(
            ReservationStatus status, PaymentStatus paymentStatus,
            Long userId, Long roomId, int page, int size
    );

    ReservationDetailResponse getReservationById(Long id, UserPrincipal user);

    ReservationStatusResponse updateStatus(Long id, ReservationStatus status, UserPrincipal user);

    List<ServiceItemResponse> getServices(Long reservationId, UserPrincipal currentUser);

    ServiceItemResponse addService(Long reservationId, AddServiceRequest request, UserPrincipal currentUser);

    List<ReservationGuestResponse> getGuests(Long reservationId, UserPrincipal currentUser);

    ReservationGuestResponse addGuest(Long reservationId, ReservationGuestRequest request, UserPrincipal currentUser);

    void deleteGuest(Long reservationId, Long guestId, UserPrincipal currentUser);
    void confirmPayment(Long reservationId);
}
