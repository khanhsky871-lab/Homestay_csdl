package vn.huy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.huy.model.WorkSchedule;
import java.util.List;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    
    // 1. Hàm này cho ADMIN: Lấy tất cả lịch, ngày mới nhất hiện lên đầu
    List<WorkSchedule> findAllByOrderByWorkDateDesc();

    // 2. Hàm này cho NHÂN VIÊN: Chỉ lấy lịch của nhân viên đó (theo ID), ngày mới nhất lên đầu
    List<WorkSchedule> findByEmployee_IdOrderByWorkDateDesc(Long employeeId);

    List<WorkSchedule> findByEmployeeId(Long employeeId);
}