package vn.huy.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.huy.common.PaymentStatus;
import vn.huy.common.ReservationStatus;
import vn.huy.controller.request.AddServiceRequest;
import vn.huy.controller.request.ReservationCreationRequest;
import vn.huy.controller.request.ReservationGuestRequest;
import vn.huy.controller.response.*;
import vn.huy.model.UserPrincipal;
import vn.huy.service.ReservationService;

import java.util.List;


@Slf4j(topic = "RESERVATION-CONTROLLER")
@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservation", description = "Reservation lifecycle")
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "Create a reservation (customer)")
    @PostMapping
    @PreAuthorize("hasAnyAuthority('User')")
    public ResponseEntity<ApiResponse<ReservationResponse>> create(
            @AuthenticationPrincipal vn.huy.model.User user,
            @RequestBody @Valid ReservationCreationRequest request) {
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(vn.huy.controller.response.ApiResponse.error("Unauthorized"));
        }

        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
                user.getId(), user.getUsername(), user.getPassword(), user.getAuthorities()
        );

        ReservationResponse response = reservationService.createReservation(principal.getId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reservation created successfully", response));
    }

    @Operation(summary = "Update reservation (Admin, Staff, Customer)")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff', 'User')")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateReservation(@PathVariable @Min(1) Long id, @RequestBody @Valid ReservationCreationRequest request) {
        ReservationResponse response = reservationService.updateReservation(id, request);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Reservation updated successfully", response));
    }

    @Operation(summary = "Cancel reservation (customer or admin)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(@PathVariable @Min(1) Long id) {
        ReservationResponse response = reservationService.cancelReservation(id);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Reservation cancelled successfully", response));
    }

    @Operation(summary = "Get all reservations (Admin, Staff)")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public Page<ReservationResponse> getAllReservations(
            @RequestParam(required = false)ReservationStatus status,
            @RequestParam(required = false)PaymentStatus paymentStatus,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(defaultValue = "0")@Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size
    ) {

        return reservationService.getReservationsPaginated(status, paymentStatus, userId, roomId, page, size);

    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff', 'User')")
    public ResponseEntity<ApiResponse<ReservationDetailResponse>> getReservationById(
            @PathVariable @Min(1) Long id,
            @AuthenticationPrincipal vn.huy.model.User user) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
                user.getId(), user.getUsername(), user.getPassword(), user.getAuthorities()
        );
        ReservationDetailResponse response = reservationService.getReservationById(id, principal);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Reservation detail successfully", response));
    }

    @Operation(summary = "Update reservation status (Admin, Staff)")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<ApiResponse<ReservationStatusResponse>> updateReservationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReservationStatus status,
            @AuthenticationPrincipal vn.huy.model.User user
    ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
                user.getId(), user.getUsername(), user.getPassword(), user.getAuthorities()
        );
        ReservationStatusResponse response = reservationService.updateStatus(id, status, principal);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Update reservation status successfully", response));
    }

    // --- [MỚI] API THANH TOÁN & XUẤT HÓA ĐƠN ---
    @Operation(summary = "Admin confirm payment (Pay & Bill)")
    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<ApiResponse<Void>> confirmPayment(@PathVariable Long id) {
        reservationService.confirmPayment(id);
        return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công & Đã xuất hóa đơn!", null));
    }
    // -------------------------------------------

    @GetMapping("/{id}/services")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff', 'User')")
    public ResponseEntity<ApiResponse<List<ServiceItemResponse>>> getServices(
            @PathVariable Long id,
            @AuthenticationPrincipal vn.huy.model.User currentUser
    ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
                currentUser.getId(), currentUser.getUsername(), currentUser.getPassword(), currentUser.getAuthorities()
        );
        List<ServiceItemResponse> services = reservationService.getServices(id, principal);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Service list successfully", services));
    }

    @Operation(summary = "Add services to your booking (Admin, Staff)")
    @PostMapping("/{id}/services")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff')")
    public ResponseEntity<ApiResponse<ServiceItemResponse>> addServiceToReservation(
            @PathVariable Long id,
            @Valid @RequestBody AddServiceRequest request,
            @AuthenticationPrincipal vn.huy.model.User currentUser
    ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
                currentUser.getId(), currentUser.getUsername(), currentUser.getPassword(), currentUser.getAuthorities()
        );
        ServiceItemResponse response = reservationService.addService(id, request, principal);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Add service successfully", response));
    }

    @GetMapping("/{id}/guests")
    @PreAuthorize("hasAnyAuthority('Admin', 'Staff', 'User')")
    public ResponseEntity<ApiResponse<List<ReservationGuestResponse>>> getGuests(
            @PathVariable Long id,
            @AuthenticationPrincipal vn.huy.model.User currentUser
    ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
                currentUser.getId(), currentUser.getUsername(), currentUser.getPassword(), currentUser.getAuthorities()
        );
        List<ReservationGuestResponse> guests = reservationService.getGuests(id, principal);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Guest list successfully", guests));
    }

    @PostMapping("/{id}/guests")
    @PreAuthorize("hasAuthority('User')")
    public ResponseEntity<ApiResponse<ReservationGuestResponse>> addGuest(
            @PathVariable Long id,
            @Valid @RequestBody ReservationGuestRequest request,
            @AuthenticationPrincipal vn.huy.model.User user
    ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
                user.getId(), user.getUsername(), user.getPassword(), user.getAuthorities()
        );
        ReservationGuestResponse response = reservationService.addGuest(id, request, principal);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Add guest successfully", response));
    }

    @DeleteMapping("/{id}/guests/{guestId}")
    @PreAuthorize("hasAnyAuthority('User', 'Admin', 'Staff')")
    public ResponseEntity<ApiResponse<Void>> deleteGuest(
            @PathVariable Long id,
            @PathVariable Long guestId,
            @AuthenticationPrincipal vn.huy.model.User currentUser
    ) {
        vn.huy.model.UserPrincipal principal = new vn.huy.model.UserPrincipal(
                currentUser.getId(), currentUser.getUsername(), currentUser.getPassword(), currentUser.getAuthorities()
        );
        reservationService.deleteGuest(id, guestId, principal);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Delete guest successfully", null));
    }
}