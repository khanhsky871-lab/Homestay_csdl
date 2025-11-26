package vn.huy.model;

import jakarta.persistence.*;
import lombok.*; // Đảm bảo có đủ import lombok.*
import vn.huy.common.WorkStatus;
import java.time.LocalDate; // Dùng LocalDate
import java.time.LocalTime;
// Đã xóa import java.time.LocalDateTime

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "workschedule")
public class WorkSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    // --- SỬA: Đổi lại thành LocalDate cho ngày làm việc ---
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate; 

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private String task;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkStatus status;

    private String description;
    
    // Hàm setWorkDate bị lỗi đã được xóa bỏ
}