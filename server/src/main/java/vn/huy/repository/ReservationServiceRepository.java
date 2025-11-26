package vn.huy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.huy.model.ReservationServiceEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationServiceRepository extends JpaRepository<ReservationServiceEntity, Long> {

    List<ReservationServiceEntity> findByReservation_Id(Long reservationId);

    Optional<ReservationServiceEntity> findByReservation_IdAndService_Id(Long reservationId, Long serviceId);

    @Query("SELECT SUM(rs.quantity * rs.unitPrice) FROM ReservationServiceEntity rs WHERE rs.reservation.id = :reservationId")
    BigDecimal sumTotalByReservationId(@Param("reservationId") Long reservationId);
}
