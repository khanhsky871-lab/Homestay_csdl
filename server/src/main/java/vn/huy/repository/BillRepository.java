package vn.huy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.huy.model.Bill;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill,Long> {
    List<Bill> findByUser_Id(Long userId);
}
