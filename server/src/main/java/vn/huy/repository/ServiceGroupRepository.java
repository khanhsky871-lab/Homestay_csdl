package vn.huy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.huy.model.ServiceGroup;

import java.util.Optional;

public interface ServiceGroupRepository extends JpaRepository<ServiceGroup, Long> {
    boolean existsByNameContainingIgnoreCase(String name);

    Optional<ServiceGroup> findByNameIgnoreCase(String name);

    @Query("SELECT DISTINCT sg FROM ServiceGroup sg " +
            "LEFT JOIN FETCH sg.services " +
            "WHERE sg.id = :id")
    Optional<ServiceGroup> findByIdWithServices(@Param("id") Long id);
}
