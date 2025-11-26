package vn.huy.controller.request;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class BulkCreateWorkScheduleRequest {
    private Long employeeId;
    private LocalDate fromDate; // Ngày bắt đầu
    private LocalDate toDate;   // Ngày kết thúc
    private String dayOff;      // Ngày nghỉ (MONDAY, TUESDAY... hoặc NONE)
    private LocalTime startTime;
    private LocalTime endTime;
    private String task;
    private String description;
}