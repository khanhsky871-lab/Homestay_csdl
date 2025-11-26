package vn.huy.controller.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import vn.huy.common.RoomStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class RoomStatusHistoryResponse {
    private Long id;
    private RoomStatus status;
    private Long changed_by;
    private String changed_by_name;
    private LocalDateTime changed_at;
}
