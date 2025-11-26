package vn.huy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.huy.model.ReservationGuest;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationGuestRepository extends JpaRepository<ReservationGuest, Long> {
    Optional<ReservationGuest> findByIdAndReservationId(Long id, Long reservationId);

    List<ReservationGuest> findByReservation_Id(Long reservationId);
}
