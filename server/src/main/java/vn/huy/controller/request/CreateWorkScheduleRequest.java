package vn.huy.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.huy.common.WorkStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class CreateWorkScheduleRequest {

    @NotNull(message = "employeeId is required")
    private Long employeeId;

    @NotNull(message = "workDate is required")
    private LocalDateTime workDate;

    @NotNull(message = "startTime is required")
    private LocalTime startTime;

    @NotNull(message = "endTime is required")
    private LocalTime endTime;

    @NotBlank(message = "task is required")
    private String task;

    @NotBlank(message = "status is required")
    private WorkStatus status;

    private String description;
}
