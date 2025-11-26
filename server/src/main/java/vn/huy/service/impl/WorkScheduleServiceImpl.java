package vn.huy.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.huy.common.WorkStatus;
import vn.huy.controller.request.BulkCreateWorkScheduleRequest;
import vn.huy.controller.request.CreateWorkScheduleRequest;
import vn.huy.controller.response.WorkScheduleResponse;
import vn.huy.exception.ResourceNotFoundException;
import vn.huy.model.User;
import vn.huy.model.WorkSchedule;
import vn.huy.repository.UserRepository;
import vn.huy.repository.WorkScheduleRepository;
import vn.huy.service.WorkScheduleService;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkScheduleServiceImpl implements WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;
    private final UserRepository userRepository;

    // --- HÀM 1: Lấy tất cả lịch (Admin) ---
    @Override
    public List<WorkScheduleResponse> getAllWorkSchedules() {
        List<WorkSchedule> schedules = workScheduleRepository.findAllByOrderByWorkDateDesc();
        return schedules.stream().map(this::mapToResponse).toList();
    }
    
    @Override
@Transactional 
public List<WorkScheduleResponse> getMySchedules(Long userId) {
    
    // Server phải load user và schedule trong cùng 1 transaction
    List<WorkSchedule> schedules = workScheduleRepository.findByEmployee_IdOrderByWorkDateDesc(userId);
    
    // Lỗi LZE sẽ được giải quyết vì transaction vẫn active khi mapper chạy
    return schedules.stream().map(this::mapToResponse).toList();
}

    // Implement the interface method expected (singular 'getMySchedule')
    public List<WorkScheduleResponse> getMySchedule(Long userId) {
        return getMySchedules(userId);
    }

    @Override
    public List<WorkScheduleResponse> getWorkSchedulesByEmployeeId(Long employeeId) {
        List<WorkSchedule> schedules = workScheduleRepository.findByEmployee_IdOrderByWorkDateDesc(employeeId);
        return schedules.stream().map(this::mapToResponse).toList();
    }

    // --- HÀM 4: Tạo lịch đơn lẻ ---
    @Override
    public WorkScheduleResponse createWorkSchedule(CreateWorkScheduleRequest request) {
        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        WorkSchedule workSchedule = new WorkSchedule();
        workSchedule.setEmployee(employee);
        // request.workDate is LocalDateTime; store only the date portion
        workSchedule.setWorkDate(request.getWorkDate().toLocalDate());
        workSchedule.setStartTime(request.getStartTime());
        workSchedule.setEndTime(request.getEndTime());
        workSchedule.setTask(request.getTask());
        workSchedule.setDescription(request.getDescription());
        workSchedule.setStatus(WorkStatus.InProgress);

        workScheduleRepository.save(workSchedule);
        return mapToResponse(workSchedule);
    }

    // --- HÀM 5: Tạo lịch hàng loạt (BULK) ---
    @Override
    @Transactional
    public void createBulkSchedule(BulkCreateWorkScheduleRequest request) {
        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (request.getFromDate().isAfter(request.getToDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        LocalDate currentDate = request.getFromDate();

        while (!currentDate.isAfter(request.getToDate())) {
            
            String currentDayOfWeek = currentDate.getDayOfWeek().name();

            if (!currentDayOfWeek.equalsIgnoreCase(request.getDayOff())) {
                
                WorkSchedule schedule = new WorkSchedule();
                schedule.setEmployee(employee);
                schedule.setWorkDate(currentDate); 
                schedule.setStartTime(request.getStartTime());
                schedule.setEndTime(request.getEndTime());
                schedule.setTask(request.getTask());
                schedule.setDescription(request.getDescription());
                schedule.setStatus(WorkStatus.InProgress);

                workScheduleRepository.save(schedule);
            }
            currentDate = currentDate.plusDays(1);
        }
    }
    

    @Override
    public void deleteWorkSchedule(Long id) {
        if (!workScheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Schedule not found");
        }
        workScheduleRepository.deleteById(id);
    }
    
    // --- MAPPER HELPER ---
    private WorkScheduleResponse mapToResponse(WorkSchedule s) {
        return new WorkScheduleResponse(
            s.getId(),
            s.getEmployee().getId(),
            s.getEmployee().getName(),
            s.getWorkDate(),
            s.getStartTime(),
            s.getEndTime(),
            s.getTask(),
            s.getStatus(),
            s.getDescription()
        );
    }

    @Override
    public List<WorkScheduleResponse> getMySchedule() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getMySchedule'");
    }
}