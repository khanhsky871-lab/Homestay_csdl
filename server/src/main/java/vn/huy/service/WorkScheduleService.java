package vn.huy.service;

import vn.huy.controller.request.BulkCreateWorkScheduleRequest;
import vn.huy.controller.request.CreateWorkScheduleRequest;
import vn.huy.controller.response.WorkScheduleResponse;

import java.util.List;

public interface WorkScheduleService {

    List<WorkScheduleResponse> getAllWorkSchedules();

    WorkScheduleResponse createWorkSchedule(CreateWorkScheduleRequest request);

    void deleteWorkSchedule(Long id);

    void createBulkSchedule(BulkCreateWorkScheduleRequest request);

    List<WorkScheduleResponse> getMySchedules(Long userId);

    List<WorkScheduleResponse> getWorkSchedulesByEmployeeId(Long employeeId);
    List<WorkScheduleResponse> getMySchedule();

    List<WorkScheduleResponse> getMySchedule(Long userId);
}
