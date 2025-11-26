package vn.huy.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.huy.controller.request.BulkCreateWorkScheduleRequest;
import vn.huy.controller.request.CreateWorkScheduleRequest;
import vn.huy.controller.response.ApiResponse;
import vn.huy.controller.response.WorkScheduleResponse;
import vn.huy.service.WorkScheduleService;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@Slf4j(topic = "WORK-SCHEDULE")
@Tag(name = "Work Schedule", description = "Work Schedule Management")
public class WorkScheduleController {

    private final WorkScheduleService workScheduleService;

    @Operation(summary = "Work schedule list (Admin, Staff)")
    @GetMapping
    
    public ResponseEntity<ApiResponse<List<WorkScheduleResponse>>> getAllWorkSchedules() {
        List<WorkScheduleResponse> schedules = workScheduleService.getAllWorkSchedules();
        return ResponseEntity.ok(
                ApiResponse.success("Work schedule list", schedules)
        );
    }

    @Operation(summary = "Create a work schedule (Admin)")
    @PostMapping
    
    public ResponseEntity<ApiResponse<WorkScheduleResponse>> createWorkSchedule(
            @Valid @RequestBody CreateWorkScheduleRequest request
    ) {
        WorkScheduleResponse response = workScheduleService.createWorkSchedule(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work schedule created", response));
    }
    @Operation(summary = "Work schedule for the logged-in employee")
    @GetMapping("/my-schedule")
    public ResponseEntity<ApiResponse<List<WorkScheduleResponse>>> getMySchedule() {

        List<WorkScheduleResponse> schedules = workScheduleService.getMySchedule();
        
        return ResponseEntity.ok(
                ApiResponse.success("My work schedule", schedules)
        );
    }

    @Operation(summary = "Delete work-schedule (Admin)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkSchedule(@PathVariable Long id) {
        workScheduleService.deleteWorkSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Work Schedule has deleted", null));
    }

    @PostMapping("/bulk")
    public ResponseEntity<vn.huy.controller.response.ApiResponse<?>> createBulkSchedule(
            @RequestBody vn.huy.controller.request.BulkCreateWorkScheduleRequest request) {
        
        workScheduleService.createBulkSchedule(request);
        
        return ResponseEntity.ok(vn.huy.controller.response.ApiResponse.success(
                "Phân công lịch hàng loạt thành công!", null));
    }
}