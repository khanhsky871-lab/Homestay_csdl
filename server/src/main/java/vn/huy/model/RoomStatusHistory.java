package vn.huy.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import vn.huy.common.RoomStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "roomstatushistory")
public class RoomStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RoomStatus status;

    @Column(name = "changed_at")
    @CreationTimestamp
    private LocalDateTime changedAt;

    @Column(name = "changed_by")
    private Long changedBy;
}
