package vn.huy.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.huy.common.PaymentStatus;
import vn.huy.common.ReservationStatus;
import vn.huy.controller.request.AddServiceRequest;
import vn.huy.controller.request.ReservationCreationRequest;
import vn.huy.controller.request.ReservationGuestRequest;
import vn.huy.controller.response.*;
import vn.huy.exception.ResourceNotFoundException;
import vn.huy.model.*;
import vn.huy.repository.*;
import vn.huy.service.BillService;
import vn.huy.service.ReservationService;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ReservationGuestRepository reservationGuestRepository;
    private final ReservationServiceRepository reservationServiceRepository;
    private final ServiceRepository serviceRepository;
    
    // Inject BillService để tạo hóa đơn
    private final BillService billService; 

    @Override
    public ReservationResponse createReservation(Long userId, ReservationCreationRequest request) {
        Room room = getRoom(request.getRoomId());
        User user = getUser(userId);

        // 1. Validate ngày tháng
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new IllegalArgumentException("Ngày trả phòng phải sau ngày nhận phòng");
        }

        // 2. Validate số người
        if (request.getNumGuests() > room.getCapacity()) {
            throw new IllegalArgumentException("Số lượng khách vượt quá sức chứa của phòng");
        }

        // 3. Kiểm tra trùng lịch (Dùng hàm custom query)
        boolean isBooked = reservationRepository.existsOverlappingReservation(
                room.getId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (isBooked) {
            throw new RuntimeException("Phòng này đã có người đặt trong khoảng thời gian này!");
        }

        // 4. Tính toán số đêm (Dùng ChronoUnit để tính đúng ngày lịch)
        long days = ChronoUnit.DAYS.between(request.getCheckInDate().toLocalDate(), request.getCheckOutDate().toLocalDate());
        if (days <= 0) days = 1;
        int nights = (int) days;

        BigDecimal roomPrice = room.getPrice();
        BigDecimal total = roomPrice.multiply(BigDecimal.valueOf(nights));

        // 5. Tạo đối tượng Reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setRoom(room);
        reservation.setNights(nights);
        reservation.setBookingDate(LocalDateTime.now());
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setNumGuests(request.getNumGuests());
        
        reservation.setRoomPrice(roomPrice);
        reservation.setTotal(total);
        
        reservation.setStatus(ReservationStatus.Pending);
        reservation.setPaymentStatus(PaymentStatus.Unpaid);
        reservation.setPaymentMethod(request.getPaymentMethod());

        reservationRepository.save(reservation);
        return toResponse(reservation);
    }

    // --- HÀM THANH TOÁN ---
    @Override
    @Transactional
    public void confirmPayment(Long reservationId) {
        Reservation reservation = getReservation(reservationId);

        if (reservation.getPaymentStatus() == PaymentStatus.Paid) {
            throw new RuntimeException("Đơn này đã được thanh toán rồi!");
        }

        // 1. Cập nhật trạng thái
        reservation.setPaymentStatus(PaymentStatus.Paid);
        reservation.setStatus(ReservationStatus.Confirmed);
        reservation.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(reservation);

        // 2. Tạo hóa đơn (Gọi sang BillService)
        billService.createBill(reservationId);
    }

    @Override
    public ReservationResponse updateReservation(Long id, ReservationCreationRequest req) {
        Reservation reservation = getReservation(id);

        if (reservation.getStatus() == ReservationStatus.Cancelled ||
                reservation.getStatus() == ReservationStatus.Checked_out) {
            throw new IllegalStateException("Cannot update cancelled or checked-out reservation");
        }

        // Update ngày và tính lại tiền
        if (req.getCheckInDate() != null && req.getCheckOutDate() != null) {
            if (!req.getCheckOutDate().isAfter(req.getCheckInDate())) {
                throw new IllegalArgumentException("Check-out date must be after check-in date");
            }
            
            reservation.setCheckInDate(req.getCheckInDate());
            reservation.setCheckOutDate(req.getCheckOutDate());
            
            // Tính lại ngày bằng ChronoUnit
            long days = ChronoUnit.DAYS.between(req.getCheckInDate().toLocalDate(), req.getCheckOutDate().toLocalDate());
            if(days <= 0) days = 1;
            int nights = (int) days;
            
            reservation.setTotal(reservation.getRoomPrice().multiply(BigDecimal.valueOf(nights)));
            reservation.setNights(nights);
        }

        if (req.getNumGuests() != null) {
            if (req.getNumGuests() > reservation.getRoom().getCapacity()) {
                throw new IllegalArgumentException("Number of guests exceeds room capacity");
            }
            reservation.setNumGuests(req.getNumGuests());
        }

        if (req.getPaymentMethod() != null) {
            reservation.setPaymentMethod(req.getPaymentMethod());
        }
        reservation.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(reservation);
        return toResponse(reservation);
    }

    @Override
    public ReservationResponse cancelReservation(Long id) {
        Reservation reservation = getReservation(id);
        if (reservation.getStatus() == ReservationStatus.Checked_out) {
            throw new IllegalStateException("Cannot cancel reservation");
        }

        reservation.setStatus(ReservationStatus.Cancelled);
        reservation.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(reservation);
        return toResponse(reservation);
    }

    @Override
    public Page<ReservationResponse> getReservationsPaginated(
            ReservationStatus status,
            PaymentStatus paymentStatus,
            Long userId,
            Long roomId,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());

        Page<Reservation> pageResult = reservationRepository.findByFilter(status, paymentStatus, userId, roomId, pageable);

        return pageResult.map(res -> {
            User user = getUser(res.getUser().getId());
            Room room = getRoom(res.getRoom().getId());
                return new ReservationResponse(
                    res.getId(),
                    res.getUser().getId(),
                    user != null ? user.getName() : null,
                    res.getRoom().getId(),
                    room != null ? room.getName() : null,
                    res.getBookingDate(),
                    res.getCheckInDate(),
                    res.getCheckOutDate(),
                    res.getNumGuests(),
                    res.getNights(),
                    res.getRoomPrice(),
                    res.getStatus(),
                    res.getPaymentStatus(),
                    res.getPaymentMethod(),
                    res.getTotal()
                );
        });
    }

    @Override
    public ReservationDetailResponse getReservationById(Long id, UserPrincipal user) {
        Reservation reservation = getReservation(id);

        if (user.hasRole("User") && !reservation.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("You do not have permission to view this reservation");
        }

        User customer = getUser(user.getId());
        Room room = getRoom(reservation.getRoom().getId());

        List<ReservationServiceEntity> list = reservationServiceRepository.findByReservation_Id(id);
        List<ServiceItemResponse> services = list.stream().map(s -> {
            ServiceEntity service = getService(s.getService().getId());
            return new ServiceItemResponse(
                    s.getService().getId(),
                    service != null ? service.getName() : null,
                    s.getQuantity(),
                    s.getUnitPrice()
            );
        }).toList();

        List<ReservationGuest> guests = reservationGuestRepository.findByReservation_Id(id);
        List<ReservationGuestResponse> guestResponses = guests.stream().map(g ->
                new ReservationGuestResponse(g.getId(), g.getName(), g.getIdentityCard())
        ).toList();

        return new ReservationDetailResponse(
                reservation.getId(),
                reservation.getUser().getId(),
                customer != null ? customer.getName() : null,
                reservation.getRoom().getId(),
                room != null ? room.getName() : null,
                reservation.getBookingDate(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                reservation.getNumGuests(),
                reservation.getNights(),
                reservation.getRoomPrice(),
                reservation.getStatus(),
                reservation.getPaymentStatus(),
                reservation.getPaymentMethod(),
                reservation.getTotal(),
                services,
                guestResponses
        );
    }

    @Override
    public ReservationStatusResponse updateStatus(Long id, ReservationStatus status, UserPrincipal user) {
        Reservation reservation = getReservation(id);
        reservation.setStatus(status);
        reservation.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(reservation);
        return new ReservationStatusResponse(
                reservation.getId(),
                reservation.getStatus(),
                reservation.getUpdatedAt()
        );
    }

    @Override
    public List<ServiceItemResponse> getServices(Long reservationId, UserPrincipal currentUser) {
        Reservation reservation = getReservation(reservationId);
        if (currentUser.hasRole("User") &&
            !reservation.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("You cannot view services of another user's reservation");
        }
        List<ReservationServiceEntity> serviceList =
                reservationServiceRepository.findByReservation_Id(reservationId);
        return serviceList.stream().map(s -> {
            ServiceEntity service = getService(s.getService().getId());
            return new ServiceItemResponse(
                    s.getService().getId(),
                    service != null ? service.getName() : null,
                    s.getQuantity(),
                    s.getUnitPrice()
            );
        }).toList();
    }

    @Override
    public ServiceItemResponse addService(Long reservationId, AddServiceRequest request, UserPrincipal currentUser) {
        Reservation reservation = getReservation(reservationId);
        ServiceEntity service = getService(request.getServiceId());

        Optional<ReservationServiceEntity> existed =
                reservationServiceRepository.findByReservation_IdAndService_Id(reservationId, request.getServiceId());

        ReservationServiceEntity item;
        if (existed.isPresent()) {
            item = existed.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            item = new ReservationServiceEntity();
            item.setReservation(reservation);
            item.setService(service);
            item.setQuantity(request.getQuantity());
            item.setUnitPrice(service.getUnitPrice());
        }
        
        BigDecimal totalServicePrice = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        item.setTotalPrice(totalServicePrice); 
        // ---------------------------------------
        
        reservationServiceRepository.save(item);

        BigDecimal roomPrice = reservation.getRoomPrice() != null ? reservation.getRoomPrice() : BigDecimal.ZERO;
        BigDecimal serviceTotal = reservationServiceRepository.sumTotalByReservationId(reservationId);
        
        if (serviceTotal == null) serviceTotal = BigDecimal.ZERO;
        
        reservation.setTotal(roomPrice.add(serviceTotal));
        reservationRepository.save(reservation);

        return new ServiceItemResponse(
                service.getId(),
                service.getName(),
                item.getQuantity(),
                service.getUnitPrice()
        );
    }

    @Override
    public List<ReservationGuestResponse> getGuests(Long reservationId, UserPrincipal currentUser) {
        Reservation reservation = getReservation(reservationId);
        if (currentUser.hasRole("User") &&
            !reservation.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("You cannot view another user's guests");
        }
        List<ReservationGuest> guests = reservationGuestRepository.findByReservation_Id(reservationId);
        return guests.stream()
                .map(g -> new ReservationGuestResponse(g.getId(), g.getName(), g.getIdentityCard()))
                .toList();
    }

    @Override
    public ReservationGuestResponse addGuest(Long reservationId, ReservationGuestRequest request, UserPrincipal currentUser) {
        Reservation reservation = getReservation(reservationId);
        if (!reservation.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("You cannot add guests to another user's reservation");
        }
        ReservationGuest guest = new ReservationGuest();
        guest.setReservation(reservation);
        guest.setName(request.getName());
        guest.setIdentityCard(request.getIdentityCard());
        reservationGuestRepository.save(guest);
        return new ReservationGuestResponse(guest.getId(), guest.getName(), guest.getIdentityCard());
    }

    @Override
    public void deleteGuest(Long reservationId, Long guestId, UserPrincipal currentUser) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        ReservationGuest guest = reservationGuestRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        if (!guest.getReservation().getId().equals(reservation.getId())) {
            throw new RuntimeException("Guest does not belong to this reservation");
        }
        if (currentUser.hasRole("User") &&
            !reservation.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("You cannot delete guest from another user's reservation");
        }
        reservationGuestRepository.delete(guest);
    }

    // --- HELPERS ---
    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Room getRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
    }

    private Reservation getReservation(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    private ServiceEntity getService(Long serviceId) {
        return serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    }

    private ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse res = new ReservationResponse();
        res.setId(reservation.getId());
        res.setUserId(reservation.getUser().getId());
        res.setRoomId(reservation.getRoom().getId());
        res.setBookingDate(reservation.getBookingDate());
        res.setCheckInDate(reservation.getCheckInDate());
        res.setCheckOutDate(reservation.getCheckOutDate());
        res.setNumGuests(reservation.getNumGuests());
        res.setNights(reservation.getNights());
        res.setRoomPrice(reservation.getRoomPrice());
        res.setStatus(reservation.getStatus());
        res.setPaymentStatus(reservation.getPaymentStatus());
        res.setPaymentMethod(reservation.getPaymentMethod());
        res.setTotal(reservation.getTotal());
        return res;
    }
}