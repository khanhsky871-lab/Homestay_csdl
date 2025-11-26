package vn.huy.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import vn.huy.controller.request.AddBillDetailRequest;
import vn.huy.controller.request.CreateBillRequest;
import vn.huy.controller.response.BillDetailResponse;
import vn.huy.controller.response.BillResponse;
import vn.huy.controller.response.BillWithDetailsResponse;
import vn.huy.exception.ResourceNotFoundException;
import vn.huy.model.*;
import vn.huy.repository.*;
import vn.huy.service.BillService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {
    private final BillRepository billRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationServiceRepository reservationServiceRepository;
    private final BillDetailRepository billDetailRepository;
    private final ServiceRepository serviceRepository;

    @Override
    public List<BillResponse> getAllBills(UserPrincipal currentUser) {
        List<Bill> bills;

        if (currentUser.hasRole("User")) {
            // User only takes his bill
            bills = billRepository.findByUser_Id(currentUser.getId());
        } else {
            // Admin/Staff take all
            bills = billRepository.findAll();
        }

        return bills.stream()
                .map(b -> new BillResponse(
                        b.getId(),
                        b.getReservation().getId(),
                        b.getTotal(),
                        b.getCreatedAt(),
                        b.getUpdatedAt()
                ))
                .toList();
    }

    // --- HÀM CŨ (DÙNG CHO TẠO THỦ CÔNG) ---
    @Override
    public BillResponse createBill(CreateBillRequest request, UserPrincipal currentUser) {
        // 1. Load reservation
        Reservation reservation = getReservation(request.getReservationId());

        // 2. Calculate total price: room + service
        BigDecimal roomPrice = reservation.getRoomPrice() != null
                ? reservation.getRoomPrice()
                : BigDecimal.ZERO;
        BigDecimal servicesTotal = reservationServiceRepository.sumTotalByReservationId(reservation.getId());
        if (servicesTotal == null) servicesTotal = BigDecimal.ZERO;

        BigDecimal total = roomPrice.add(servicesTotal);

        // If Admin wants to overwrite total manually
        if (request.getTotal() != null) {
            total = request.getTotal();
        }

        // 3. Create bill
        Bill bill = new Bill();
        bill.setReservation(reservation);
        bill.setUser(reservation.getUser());
        bill.setTotal(total);

        billRepository.save(bill);

        // 4. Map to response
        return new BillResponse(
                bill.getId(),
                bill.getReservation().getId(),
                bill.getTotal(),
                bill.getCreatedAt(),
                bill.getUpdatedAt()
        );
    }

    @Override
    @Transactional // Đảm bảo tạo cả Bill và BillDetail thành công
    public void createBill(Long reservationId) {
        // 1. Load reservation
        Reservation reservation = getReservation(reservationId);
        
        // 2. Tạo hóa đơn TỔNG (Bill) và lưu lại để lấy ID
        Bill bill = new Bill();
        bill.setReservation(reservation);
        bill.setUser(reservation.getUser());
        bill.setTotal(reservation.getTotal()); 
        bill.setCreatedAt(LocalDateTime.now()); 
        Bill savedBill = billRepository.save(bill); // <<< LƯU LẠI ĐỂ LẤY ID HÓA ĐƠN

        // 3. Lấy tất cả dịch vụ đã dùng cho đơn đặt phòng này
        List<ReservationServiceEntity> usedServices = 
            reservationServiceRepository.findByReservation_Id(reservationId);
        
        // 4. Chuyển từng dịch vụ đã dùng sang bảng BillDetail
        for (ReservationServiceEntity usedItem : usedServices) {
            BillDetail detail = new BillDetail();
            
            detail.setBill(savedBill); // Gán khóa ngoại Bill vừa tạo
            detail.setReservation(reservation); // Gán khóa ngoại Reservation
            detail.setService(usedItem.getService());
            detail.setQuantity(usedItem.getQuantity());
            
            detail.setPrice(usedItem.getUnitPrice()); 
            
            billDetailRepository.save(detail); // Lưu chi tiết
        }
    }
    @Override
    public BillWithDetailsResponse getBillDetails(Long billId, UserPrincipal currentUser) {
        Bill bill = getBill(billId);

        // Customers can only see their own invoices
        if (currentUser.hasRole("User") &&
                !bill.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("You cannot view this bill");
        }

        // Get service details
        List<BillDetail> details = billDetailRepository.findByBill_Id(billId);
        List<BillDetailResponse> detailResponses = details.stream()
                .map(d -> new BillDetailResponse(
                        d.getService().getId(),
                        d.getService().getName(),
                        d.getQuantity(),
                        d.getPrice()
                ))
                .toList();

        return new BillWithDetailsResponse(
                bill.getId(),
                bill.getReservation().getId(),
                bill.getTotal(),
                bill.getCreatedAt(),
                bill.getUpdatedAt(),
                detailResponses
        );
    }

    @Override
    public BillDetailResponse addBillDetail(Long billId, AddBillDetailRequest request, UserPrincipal currentUser) {
        // 1. Load bill
        Bill bill = getBill(billId);

        // 2. Load service
        ServiceEntity service = getService(request.getServiceId());

        // 3. Check if the service is included in the bill
        Optional<BillDetail> existed = billDetailRepository.findByBill_IdAndService_Id(billId, request.getServiceId());

        BillDetail detail;

        if (existed.isPresent()) {
            detail = existed.get();
            detail.setQuantity(detail.getQuantity() + request.getQuantity());
        } else {
            detail = new BillDetail();
            detail.setBill(bill);
            detail.setService(service);
            detail.setQuantity(request.getQuantity());
            detail.setPrice(service.getUnitPrice());
        }

        billDetailRepository.save(detail);

        // 4. Update total bill
        BigDecimal serviceTotal = billDetailRepository.sumTotalByBillId(billId);
        BigDecimal roomPrice = bill.getReservation().getRoomPrice() != null
                ? bill.getReservation().getRoomPrice() : BigDecimal.ZERO;

        bill.setTotal(roomPrice.add(serviceTotal));
        billRepository.save(bill);

        // 5. Map to response
        return new BillDetailResponse(
                service.getId(),
                service.getName(),
                detail.getQuantity(),
                detail.getPrice()
        );
    }


    private Reservation getReservation(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    private Bill getBill(Long billId) {
        return billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
    }

    private ServiceEntity getService(Long serviceId) {
        return serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    }
}