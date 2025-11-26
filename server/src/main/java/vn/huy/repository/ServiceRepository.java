package vn.huy.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.huy.model.ServiceEntity;

import java.math.BigDecimal;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {

    // 👇 ĐÃ SỬA: Đổi tất cả 's.group' thành 's.serviceGroup'
    @Query("SELECT DISTINCT s FROM ServiceEntity s " +
            "LEFT JOIN FETCH s.serviceGroup " + 
            "WHERE (:groupId IS NULL OR s.serviceGroup.id = :groupId) " +
            "AND (:isActive IS NULL OR s.isActive = :isActive) " +
            "AND (:minPrice IS NULL OR s.unitPrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR s.unitPrice <= :maxPrice)")
    Page<ServiceEntity> findByFilter(
            @Param("groupId") Integer groupId,
            @Param("isActive") Boolean isActive,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    // 👇 ĐÃ SỬA: Đổi thành 'ServiceGroup'
    boolean existsByNameAndServiceGroup_Id(String name, Long groupId);

    // 👇 ĐÃ SỬA: Đổi thành 'ServiceGroup'
    boolean existsByServiceGroup_Id(Long id);
}