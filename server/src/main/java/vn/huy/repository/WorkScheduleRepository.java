package vn.huy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.huy.model.WorkSchedule;
import java.util.List;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    
    
    List<WorkSchedule> findAllByOrderByWorkDateDesc();

 
    List<WorkSchedule> findByEmployee_IdOrderByWorkDateDesc(Long employeeId);

    List<WorkSchedule> findByEmployeeId(Long employeeId);
}