package vn.huy.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.huy.common.PaymentStatus;
import vn.huy.common.ReservationStatus;
import vn.huy.model.Reservation;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long>{
    boolean existsByRoomIdAndStatusInAndCheckInDateLessThanAndCheckOutDateGreaterThan(
            Long roomId, List<ReservationStatus> status, LocalDateTime checkOut, LocalDateTime checkIn
    );

    @Query(value = "select distinct r from Reservation r " +
            "where (:status is null or r.status =: status) " +
            "and (:paymentStatus is null or r.paymentStatus =: paymentStatus) " +
            "and (:userId is null or r.user.id =: userId) " +
            "and (:roomId is null or r.room.id =: roomId)")
    Page<Reservation> findByFilter(
            @Param("status") ReservationStatus status,
            @Param("paymentStatus")PaymentStatus paymentStatus,
            @Param("userId") Long userId,
            @Param("roomId") Long roomId,
            Pageable pageable
            );
        @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reservation r " +
           "WHERE r.room.id = :roomId " +
           "AND r.status NOT IN ('Cancelled', 'Rejected', 'Deleted') " + 
           "AND (r.checkInDate < :checkOutDate AND r.checkOutDate > :checkInDate)")
    boolean existsOverlappingReservation(@Param("roomId") Long roomId, 
                                         @Param("checkInDate") LocalDateTime checkInDate, 
                                         @Param("checkOutDate") LocalDateTime checkOutDate);
}
