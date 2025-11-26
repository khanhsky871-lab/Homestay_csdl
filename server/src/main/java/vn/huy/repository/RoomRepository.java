package vn.huy.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.huy.common.RoomStatus;
import vn.huy.common.RoomType;
import vn.huy.model.Room;

import java.math.BigDecimal;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query(value = "SELECT DISTINCT r FROM Room r " +
            "LEFT JOIN FETCH r.images " +
            "WHERE (:status IS NULL OR r.status = :status) " +
            "AND (:capacity IS NULL OR r.capacity >= :capacity) " +
            "AND (:minPrice IS NULL OR r.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR r.price <= :maxPrice) " +
            "AND (:type IS NULL OR r.type = :type)")
    Page<Room> findRoomsByFilters(
            @Param("type") RoomType type,
            @Param("status") RoomStatus status,
            @Param("capacity") Integer capacity,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    boolean existsByName(String name);


    @Query(value = "select r.name from Room r where r.id =:id")
    String findByNameById(@Param("id") Long id);
}

