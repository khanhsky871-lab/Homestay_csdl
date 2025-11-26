package vn.huy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.huy.model.BillDetail;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillDetailRepository extends JpaRepository<BillDetail,Long> {
    List<BillDetail> findByBill_Id(Long billId);

    Optional<BillDetail> findByBill_IdAndService_Id(Long billId, Long serviceId);

    @Query("SELECT SUM(bd.quantity * bd.price) FROM BillDetail bd WHERE bd.bill.id = :billId")
    BigDecimal sumTotalByBillId(@Param("billId") Long billId);
}
